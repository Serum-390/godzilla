package ca.serum390.godzilla.util.Events;

import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public class ProductionEvent extends ERPEvent {
    private Integer productionID;
}
