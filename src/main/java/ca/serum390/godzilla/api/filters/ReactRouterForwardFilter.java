package ca.serum390.godzilla.api.filters;

import static org.springframework.http.HttpMethod.POST;

import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;

import reactor.core.publisher.Mono;

/**
 * This {@link WebFilter} component is needed to forward requests to the React
 * Router routes.
 */
@Component
public class ReactRouterForwardFilter implements WebFilter {

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        if (matchesReactRouterRoute(exchange)) {
            return forwardToReactRouter(exchange, chain);
        }
        return chain.filter(exchange);
    }

    /**
     * @param exchange
     * @return
     */
    private boolean matchesReactRouterRoute(ServerWebExchange exchange) {
        var path = exchange.getRequest().getURI().getPath();
        var method = exchange.getRequest().getMethod();
        return method == null
            ? !path.startsWith("/api/")
                && !path.startsWith("/resources/")
                && !path.endsWith(".js")
                && !path.endsWith(".css")
                && !path.endsWith(".svg")
            : !path.startsWith("/api/")
                && !path.startsWith("/resources/")
                && !path.endsWith(".js")
                && !path.endsWith(".css")
                && !path.endsWith(".svg")
                && !(method.equals(POST) && path.startsWith("/login"));
    }

    /**
     *
     * @param exchange
     * @param chain
     * @return
     */
    private Mono<Void> forwardToReactRouter(ServerWebExchange exchange, WebFilterChain chain) {
        return chain.filter(
            exchange.mutate()
                .request(
                    exchange.getRequest()
                            .mutate()
                            .path("/index.html")
                            .build()
                ).build());
    }
}
