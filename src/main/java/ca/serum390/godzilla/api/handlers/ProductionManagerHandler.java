package ca.serum390.godzilla.api.handlers;

import ca.serum390.godzilla.data.repositories.InventoryRepository;
import ca.serum390.godzilla.data.repositories.OrdersRepository;
import ca.serum390.godzilla.data.repositories.PlannedProductsRepository;
import ca.serum390.godzilla.domain.inventory.Item;
import ca.serum390.godzilla.domain.manufacturing.PlannedProduct;
import ca.serum390.godzilla.domain.orders.Order;
import ca.serum390.godzilla.util.Events.ProductionEvent;
import ca.serum390.godzilla.util.Events.PurchaseOrderEvent;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.scheduling.concurrent.ConcurrentTaskScheduler;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.server.ServerRequest;
import org.springframework.web.reactive.function.server.ServerResponse;
import reactor.core.publisher.Mono;

import java.io.File;
import java.io.IOException;
import java.time.LocalDate;
import java.util.Date;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.logging.FileHandler;
import java.util.logging.Logger;
import java.util.logging.SimpleFormatter;

import static org.springframework.web.reactive.function.server.ServerResponse.noContent;

@Component
public class ProductionManagerHandler {

    //TODO fix BUGs -> save(object) -> jsonb field is null , save(parameters) -> returns empty mono

    //TODO allow cancelling the production
    // allow editing production date
    // to cancel -> cancel all the purchase orders, -> return everything taken from inventory
    // phase 1) scheduled production [no purchase order] phase 2) blocked production [purchase orders]
    // phase 1 cancel ) return all the items in item taken to inventory -> remove production/ cancel scheduler
    // phase 2 cancel ) cancel the purchase orders [ remove them]  -> return all the items in taken to inventory

    private final ApplicationEventPublisher applicationEventPublisher;
    private final PlannedProductsRepository plannedProducts;
    private final InventoryRepository inventoryRepository;
    private final OrdersRepository ordersRepository;

    private TaskScheduler scheduler;
    private Order salesOrder = null;
    private Order purchaseOrder = null;
    private LocalDate productionDate = LocalDate.now().plusDays(1);
    private Logger logger;
    private boolean isOrderReady = true;
    private boolean isOrderBlocked = false;

    public ProductionManagerHandler(ApplicationEventPublisher applicationEventPublisher, PlannedProductsRepository plannedProducts, InventoryRepository inventoryRepository, OrdersRepository ordersRepository) {
        this.applicationEventPublisher = applicationEventPublisher;
        this.plannedProducts = plannedProducts;
        this.inventoryRepository = inventoryRepository;
        this.ordersRepository = ordersRepository;
        setupLogger();
    }


    // sets up the order id and the production date for production pipeline
    // TODO add exception handling for when the query param values are not parsable
    private void setup(ServerRequest req) {
        Optional<String> orderID = req.queryParam("id");
        Optional<String> productionDateReq = req.queryParam("date");
//        salesOrder = null;
//        purchaseOrder = null;
//        productionDate = LocalDate.now().plusDays(1);
//        isOrderReady = true;
//        isOrderBlocked = false;

        // get the sales order object
        if (orderID.isPresent()) {
            salesOrder = ordersRepository.findById(Integer.parseInt(orderID.get())).block();
        }

        // Production Date setup
        if (productionDateReq.isPresent()) {
            LocalDate input = LocalDate.parse(productionDateReq.get());
            if (input.compareTo(LocalDate.now()) < 0) {
                logger.info("invalid production date is entered");
            } else {
                productionDate = input;
            }
        }

        purchaseOrder = new Order(LocalDate.now(), LocalDate.now(), "Montreal", "purchase");
    }

    // validates the order for production
    public Mono<ServerResponse> validateProduction(ServerRequest req) {
        setup(req);
        PlannedProduct plannedProduct;

        // Analyze the items in the order item list and the inventory
        if (salesOrder != null && salesOrder.getStatus().equals(Order.NEW)) {

            for (Map.Entry<Integer, Integer> orderEntry : salesOrder.getItems().entrySet()) {

                Integer orderItemID = orderEntry.getKey();
                Integer orderItemQuantity = orderEntry.getValue();

                // get item from inventory TODO change to subscribe
                Item orderItem = inventoryRepository.findById(orderItemID).block();

                if (orderItemQuantity <= orderItem.getQuantity()) {
                    inventoryRepository.updateQuantity(orderItemID, orderItem.getQuantity() - orderItemQuantity).block();

                } else {
                    isOrderReady = false;

                    // get the quantity available from inventory
                    orderItemQuantity = orderItemQuantity - orderItem.getQuantity();
                    inventoryRepository.updateQuantity(orderItemID, 0).block();

                    // check bom for that item
                    getBOMItems(orderItem, orderItemQuantity);

                }
            }
            plannedProduct = new PlannedProduct(productionDate, salesOrder.getId());
            processOrder(plannedProduct);
        } else {
            logger.info("The order ID is invalid or it is already in pipeline");
        }
        return noContent().build();
    }


    private void getBOMItems(Item orderItem, int orderItemQuantity) {
        for (Map.Entry<Integer, Integer> bomEntry : orderItem.getBillOfMaterial().entrySet()) {
            Integer bomItemID = bomEntry.getKey();
            Integer bomItemQuantity = bomEntry.getValue();

            Item bomItem = inventoryRepository.findById(bomItemID).block();

            int total_quantity = bomItemQuantity * orderItemQuantity;
            if (total_quantity <= bomItem.getQuantity()) {
                inventoryRepository.updateQuantity(bomItemID, bomItem.getQuantity() - total_quantity).block();
            } else {
                isOrderBlocked = true;
                total_quantity = total_quantity - bomItem.getQuantity();
                //update inventory
                inventoryRepository.updateQuantity(bomItemID, 0).block();

                // create purchase order this bom item with the number = total-quantity
                if (purchaseOrder.getItems().containsKey(bomItemID)) {
                    total_quantity += purchaseOrder.getItems().get(bomItemID);
                }
                purchaseOrder.getItems().put(bomItemID, total_quantity);
            }
        }
    }

    private void processOrder(PlannedProduct plannedProduct) {
        if (isOrderReady) {
            ordersRepository.updateStatus(salesOrder.getId(), Order.READY).block();
        } else {
            ordersRepository.updateStatus(salesOrder.getId(), Order.PROCESSING).block();
            plannedProduct.setStatus(isOrderBlocked ? PlannedProduct.BLOCKED : PlannedProduct.SCHEDULED);
            PlannedProduct product = plannedProducts.save(plannedProduct).block();
            purchaseOrder.setProductionID(product.getId());

            if (isOrderBlocked) {
                schedulePurchaseOrder();
            } else {
                scheduleProduction(product.getId());
            }
        }
    }


    //schedules the purchase order event
    private void schedulePurchaseOrder() {
        // Order order = ordersRepository.save(purchaseOrder.getCreatedDate(), purchaseOrder.getDueDate(), purchaseOrder.getDeliveryLocation(), purchaseOrder.getOrderType(), purchaseOrder.getStatus(), purchaseOrder.getItems(), purchaseOrder.getProductionID()).block();
        Order order = ordersRepository.save(purchaseOrder).block();
        ordersRepository.updateItems(order.getId(), purchaseOrder.getItems()).block();

        // schedule purchase order
        PurchaseOrderEvent purchaseOrderEvent = new PurchaseOrderEvent(order.getId());
        logger.info("purchase order " + order.getId() + " is created");
        Runnable purchaseTask = () -> applicationEventPublisher.publishEvent(purchaseOrderEvent);
        ScheduledExecutorService localExecutor = Executors.newSingleThreadScheduledExecutor();
        scheduler = new ConcurrentTaskScheduler(localExecutor);
        scheduler.schedule(purchaseTask, new Date(System.currentTimeMillis() + 120000));
    }

    // schedules the production event
    private void scheduleProduction(Integer productionID) {
        ProductionEvent productionEvent = new ProductionEvent(productionID);
        Runnable exampleRunnable = () -> applicationEventPublisher.publishEvent(productionEvent);
        ScheduledExecutorService localExecutor = Executors.newSingleThreadScheduledExecutor();
        scheduler = new ConcurrentTaskScheduler(localExecutor);
        scheduler.schedule(exampleRunnable, new Date(System.currentTimeMillis() + 120000));
    }


    private void setupLogger() {
        // Setup event logger
        logger = Logger.getLogger("EventLog");
        FileHandler fh;

        try {
            File dest = new File("src/main/java/ca/serum390/godzilla/util/Events/eventsLog.log");
            fh = new FileHandler(dest.getAbsolutePath());
            logger.addHandler(fh);
            SimpleFormatter formatter = new SimpleFormatter();
            fh.setFormatter(formatter);

        } catch (SecurityException | IOException e) {
            e.printStackTrace();
        }
    }
}