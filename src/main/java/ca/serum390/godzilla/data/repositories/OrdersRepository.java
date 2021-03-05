package ca.serum390.godzilla.data.repositories;

import java.time.LocalDate;

import org.springframework.data.r2dbc.repository.Modifying;
import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;

import ca.serum390.godzilla.domain.sales.Order;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface OrdersRepository extends ReactiveCrudRepository<Order, Integer> {
    @Modifying
    @Query("UPDATE orders SET CREATED_DATE = $1, DUE_DATE = $2, DELIVERY_LOCATION= $3, ORDER_TYPE=$4  WHERE ID = $5")
    Mono<Integer> update(LocalDate createdDate, LocalDate dueDate, String deliveryLocation, String orderType,
            Integer id);

    @Override
    @Query("SELECT ID, CREATED_DATE, DUE_DATE, DELIVERY_LOCATION,ORDER_TYPE, ORDER_TYPE, ITEMS FROM orders WHERE ORDER_TYPE= 'sales'")
    Flux<Order> findAll();

}
