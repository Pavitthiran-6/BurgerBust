ALTER TABLE inventory_history
    DROP CONSTRAINT ck_inventory_history_type;

ALTER TABLE inventory_history
    ADD CONSTRAINT ck_inventory_history_type
        CHECK (change_type IN (
            'CREATED',
            'UPDATED',
            'STOCK_SET',
            'ORDER_RESERVED',
            'ORDER_CANCELLED'
        ));
