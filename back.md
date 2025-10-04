
## Core Processing Flow Tables

### 1. **`wasteInventory`** - Raw Materials Storage
**Purpose**: Tracks all incoming waste materials available for processing
- **Key Fields**: `waste_type` (food packaging, metals, etc.), `quantity_kg`, `quality_grade`, `expiry_date`
- **Usage**: When creating runs, you'll check this table for available materials and reserve quantities

### 2. **`processingRecipes`** - Processing Instructions  
**Purpose**: Defines how to convert waste types into products
- **Key Fields**: `input_materials` (what waste needed), `output_products` (what you'll get), `process_steps`
- **Usage**: Templates for runs - tells you what waste + modules needed to make specific products

### 3. **`processingModules`** - Equipment/Machines
**Purpose**: Physical processing equipment (shredders, extruders, 3D printers)
- **Key Fields**: `module_type`, `status`, `throughput_kg_per_hour`, `capabilities`
- **Usage**: Check availability, reserve for runs, track maintenance needs

### 4. **`processingRuns`** - The Core Workflow
**Purpose**: Individual processing jobs that convert waste → products
- **Key Fields**: `status` (queued/running/completed), `input_quantities`, `actual_outputs`, `progress_percent`
- **Usage**: This is your main workflow table - creates jobs, tracks progress, stores results

### 5. **`productInventory`** - Finished Goods
**Purpose**: Tracks all produced items ready for use
- **Key Fields**: `product_type`, `quantity`, `quality_score`, `production_run_id`
- **Usage**: Results of successful runs, inventory for Mars colonists to use

## Supporting/Management Tables

### 6. **`users`** - System Access
**Purpose**: Mars facility operators who use the system
- **Key Fields**: `role` (admin/operator/engineer), `username`, `email`
- **Usage**: Authentication, authorization, audit trails

### 7. **`resourceUsage`** - Cost Tracking
**Purpose**: Track power, water, crew time consumed per run
- **Key Fields**: `resource_type`, `quantity_used`, `cost_estimate`
- **Usage**: Calculate operational costs, optimize efficiency

### 8. **`systemAlerts`** - Notifications
**Purpose**: System warnings and notifications
- **Key Fields**: `alert_type`, `severity`, `message`, `entity_id`
- **Usage**: Notify operators about maintenance needs, errors, resource shortages

### 9. **`dailyMetrics`** - Analytics Dashboard
**Purpose**: Aggregated daily KPIs and performance metrics
- **Key Fields**: `waste_processed_kg`, `products_created_count`, `processing_efficiency`
- **Usage**: Dashboard charts, trend analysis, reporting

### 10. **`maintenanceRecords`** - Equipment Care
**Purpose**: Schedule and track module maintenance
- **Key Fields**: `maintenance_type`, `scheduled_date`, `parts_replaced`
- **Usage**: Prevent breakdowns, track maintenance costs, schedule downtime

## Typical Workflow Example:

```
1. Check wasteInventory → "Do we have 5kg food packaging?"
2. Check processingRecipes → "Recipe X needs 5kg food packaging + shredder"  
3. Check processingModules → "Is shredder available?"
4. Create processingRuns → Reserve materials, assign module, start job
5. Worker processes → Updates run status/progress via Socket.IO
6. Insert productInventory → "Created 3 storage containers"
7. Update resourceUsage → "Consumed 2.5 kWh power"
8. Generate systemAlerts → "Module needs maintenance in 50 hours"
```

## Key Relationships:
- **Run** belongs to **Recipe** + **Module** + **User**
- **Products** come from **Runs**
- **Maintenance** happens on **Modules**
- **Alerts** can reference any entity (runs, modules, etc.)
- **Metrics** aggregate data from runs/products daily

