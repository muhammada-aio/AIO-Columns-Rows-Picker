import { createElement, ReactElement, Component } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

export default class DragAndDropList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            columnsList: [],
            values: [],
            columns: [],
            rows: [],
            filters: []
        };
    }

    _resolveLoadOptions;
    _waitAnotherPropsUpdate;

    componentDidUpdate(prevProps) {
        if (
            prevProps.options !== this.props.options &&
            this.props.options.status === "available"
        ) {
            this.getOptions().then(options => {
                const columns = this.props.columnsSelectedForTable.value === "" ? [] : JSON.parse(this.props.columnsSelectedForTable.value);
                const rows = this.props.rowsSelectedForTable.value === "" ? [] : JSON.parse(this.props.rowsSelectedForTable.value);
                const values = this.props.valuesSelectedForTable.value === "" ? [] : JSON.parse(this.props.valuesSelectedForTable.value);
                const filters = this.props.filtersSelectedForTable.value === "" ? [] : JSON.parse(this.props.filtersSelectedForTable.value);
                const filteredSelectedColumns = options.filter((el) => (![...columns, ...rows, ...values, ...filters].map(x => x.value).includes(el.value)));
                this.setState({
                    columnsList: filteredSelectedColumns,
                    columns,
                    rows,
                    values,
                    filters
                })
            })
        }
    }

    // https://reactjs.org/docs/react-component.html#unsafe_componentwillreceiveprops
    // will work in version 17.
    // eventually this has to be migrated to memoization helper with useMemo.
    async UNSAFE_componentWillReceiveProps(nextProps) {
        if (this._waitAnotherPropsUpdate) {
            this._waitAnotherPropsUpdate = false;
            return;
        }
        const options = this.getOptions(nextProps);
        this._resolveLoadOptions && this._resolveLoadOptions(await options);
        this._resolveLoadOptions = null;
    }

    getLabelValuesOption = (obj) => {
        const option = {
            value: this.getAttributeValue(this.props.valueAttribute, obj),
            label: this.getAttributeValue(this.props.displayAttribute, obj)
        }
        return option;
    };

    getAttributeValue = (attribute, obj) =>
        // Accessing an attribute from the list item directly is deprecated since mx9,
        // but the get() function doesn't yet exist yet in mx8. Thats why we have this check,
        // to have the widget work in both versions.
        attribute && ("get" in attribute ? attribute.get(obj).displayValue : attribute(obj).displayValue);


    waitUntil = condition => {
        return new Promise(resolve => {
            const interval = setInterval(() => {
                if (!condition()) {
                    return;
                }
                clearInterval(interval);
                resolve();
            }, 100);
        });
    };

    getOptions = async (props = this.props) => {
        const startTime = Date.now();
        await this.waitUntil(() => props.options.status !== "loading" || Date.now() > startTime + 500);
        if (!props.options || props.options.status !== "available") {
            return [];
        }
        return props.options.items.map(obj => {
            return this.getLabelValuesOption(obj);
        });
    };

    onDragEnd = (result) => {
        if (!result.destination) {
            return;
        }
        if (result.source && result.source.droppableId === "columnsList") {
            const fields = Array.from(this.state.columnsList);
            const [removed] = fields.splice(result.source.index, 1);
            if (result.destination.droppableId === "values") {
                const values = [...this.state.values, removed];
                this.setState({
                    columnsList: fields,
                    values: values
                });
                this.props.valuesSelectedForTable.setValue(JSON.stringify(values));
            }
            if (result.destination.droppableId === "rows") {
                const rows = [...this.state.rows, removed];
                this.setState({
                    columnsList: fields,
                    rows: rows
                });
                this.props.rowsSelectedForTable.setValue(JSON.stringify(rows));
            }
            if (result.destination.droppableId === "columns") {
                const columns = [...this.state.columns, removed];
                this.setState({
                    columnsList: fields,
                    columns: columns
                });
                this.props.columnsSelectedForTable.setValue(JSON.stringify(columns));
            }
            if (result.destination.droppableId === "filters") {
                const filters = [...this.state.filters, removed];
                this.setState({
                    columnsList: fields,
                    filters: filters
                });
                this.props.filtersSelectedForTable.setValue(JSON.stringify(filters));
            }
        }

        if (result.source && result.source.droppableId === "values") {
            const fields = Array.from(this.state.values);
            const [removed] = fields.splice(result.source.index, 1);
            if (result.destination.droppableId === "columnsList") {
                this.setState({
                    values: fields,
                    columnsList: [...this.state.columnsList, removed]
                });
                this.props.valuesSelectedForTable.setValue(JSON.stringify(fields));
            }
            if (result.destination.droppableId === "rows") {
                const rows = [...this.state.rows, removed];
                this.setState({
                    values: fields,
                    rows: rows
                });
                this.props.valuesSelectedForTable.setValue(JSON.stringify(fields));
                this.props.rowsSelectedForTable.setValue(JSON.stringify(rows));
            }
            if (result.destination.droppableId === "columns") {
                const columns = [...this.state.columns, removed];
                this.setState({
                    values: fields,
                    columns: columns
                });
                this.props.valuesSelectedForTable.setValue(JSON.stringify(fields));
                this.props.columnsSelectedForTable.setValue(JSON.stringify(columns));
            }
            if (result.destination.droppableId === "filters") {
                const filters = [...this.state.filters, removed];
                this.setState({
                    values: fields,
                    filters: filters
                });
                this.props.valuesSelectedForTable.setValue(JSON.stringify(fields));
                this.props.filtersSelectedForTable.setValue(JSON.stringify(filters));
            }
        }

        if (result.source && result.source.droppableId === "rows") {
            const fields = Array.from(this.state.rows);
            const [removed] = fields.splice(result.source.index, 1);
            if (result.destination.droppableId === "columnsList") {
                this.setState({
                    rows: fields,
                    columnsList: [...this.state.columnsList, removed]
                });
                this.props.rowsSelectedForTable.setValue(JSON.stringify(fields));
            }
            if (result.destination.droppableId === "values") {
                const values = [...this.state.values, removed];
                this.setState({
                    rows: fields,
                    values: [...this.state.values, removed]
                });
                this.props.rowsSelectedForTable.setValue(JSON.stringify(fields));
                this.props.valuesSelectedForTable.setValue(JSON.stringify(values))
            }
            if (result.destination.droppableId === "columns") {
                const columns = [...this.state.columns, removed]
                this.setState({
                    rows: fields,
                    columns: columns
                });
                this.props.rowsSelectedForTable.setValue(JSON.stringify(fields));
                this.props.columnsSelectedForTable.setValue(JSON.stringify(columns))
            }
            if (result.destination.droppableId === "filters") {
                const filters = [...this.state.filters, removed];
                this.setState({
                    rows: fields,
                    filters: filters
                });
                this.props.rowsSelectedForTable.setValue(JSON.stringify(fields));
                this.props.filtersSelectedForTable.setValue(JSON.stringify(filters))
            }
        }

        if (result.source && result.source.droppableId === "columns") {
            const fields = Array.from(this.state.columns);
            const [removed] = fields.splice(result.source.index, 1);
            if (result.destination.droppableId === "columnsList") {
                this.setState({
                    columns: fields,
                    columnsList: [...this.state.columnsList, removed]
                });
                this.props.columnsSelectedForTable.setValue(JSON.stringify(fields))
            }
            if (result.destination.droppableId === "values") {
                const values = [...this.state.values, removed];
                this.setState({
                    columns: fields,
                    values: values
                });
                this.props.columnsSelectedForTable.setValue(JSON.stringify(fields))
                this.props.valuesSelectedForTable.setValue(JSON.stringify(values));
            }
            if (result.destination.droppableId === "rows") {
                const rows = [...this.state.rows, removed];
                this.setState({
                    columns: fields,
                    rows: rows
                });
                this.props.columnsSelectedForTable.setValue(JSON.stringify(fields))
                this.props.rowsSelectedForTable.setValue(JSON.stringify(rows));
            }
            if (result.destination.droppableId === "filters") {
                const filters = [...this.state.filters, removed];
                this.setState({
                    columns: fields,
                    filters: filters
                });
                this.props.columnsSelectedForTable.setValue(JSON.stringify(fields))
                this.props.filtersSelectedForTable.setValue(JSON.stringify(filters))
            }
        }

        if (result.source && result.source.droppableId === "filters") {
            const fields = Array.from(this.state.filters);
            const [removed] = fields.splice(result.source.index, 1);
            if (result.destination.droppableId === "columnsList") {
                this.setState({
                    filters: fields,
                    columnsList: [...this.state.columnsList, removed]
                });
                this.props.filtersSelectedForTable.setValue(JSON.stringify(fields))
            }
            if (result.destination.droppableId === "values") {
                const values = [...this.state.values, removed];
                this.setState({
                    filters: fields,
                    values: values
                });
                this.props.filtersSelectedForTable.setValue(JSON.stringify(fields))
                this.props.valuesSelectedForTable.setValue(JSON.stringify(values))
            }
            if (result.destination.droppableId === "rows") {
                const rows = [...this.state.rows, removed];
                this.setState({
                    filters: fields,
                    rows: rows
                });
                this.props.filtersSelectedForTable.setValue(JSON.stringify(fields))
                this.props.rowsSelectedForTable.setValue(JSON.stringify(rows))
            }
            if (result.destination.droppableId === "columns") {
                const columns = [...this.state.columns, removed]
                this.setState({
                    filters: fields,
                    columns: columns
                });
                this.props.filtersSelectedForTable.setValue(JSON.stringify(fields))
                this.props.columnsSelectedForTable.setValue(JSON.stringify(columns))
            }
        }
    }


    render() {
        return (
            <DragDropContext onDragEnd={this.onDragEnd}>
                <div style={{ display: "flex", flexDirection: "row" }}>
                    <div style={{ flex: 1, backgroundColor: "#F8F9FA", padding: 20, borderRadius: 8, margin: "0.5em" }}>
                        <span class="mx-text loan-summary-headline text-semibold">Fields List</span>
                        <Droppable droppableId="columnsList">
                            {(provided) => (
                                <div style={{ minHeight: "100%" }} {...provided.droppableProps} ref={provided.innerRef}>
                                    {this.state.columnsList.map((item, index) => (
                                        <Draggable key={`${item.label}-columnsList-key`} draggableId={item.value} index={index}>
                                            {(provided, snapshot) => (
                                                <p
                                                    ref={provided.innerRef}
                                                    snapshot={snapshot}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                >
                                                    {item.label}
                                                </p>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </div>
                    <div style={{ flex: 1, backgroundColor: "#F8F9FA", padding: 20, borderRadius: 8, margin: "0.5em" }}>
                        <span class="mx-text loan-summary-headline text-semibold">Values</span>
                        <Droppable droppableId="values">
                            {(provided) => (
                                <div style={{ minHeight: "100%" }} {...provided.droppableProps} ref={provided.innerRef}>
                                    {this.state.values.map((item, index) => (
                                        <Draggable key={`${item.label}-values-key`} draggableId={item.value} index={index}>
                                            {(provided, snapshot) => (
                                                <p
                                                    ref={provided.innerRef}
                                                    snapshot={snapshot}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                >
                                                    {item.label}
                                                </p>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </div>
                    <div style={{ flex: 1, backgroundColor: "#F8F9FA", padding: 20, borderRadius: 8, margin: "0.5em" }}>
                        <span class="mx-text loan-summary-headline text-semibold">Columns</span>
                        <Droppable droppableId="columns">
                            {(provided) => (
                                <div style={{ minHeight: "100%" }} {...provided.droppableProps} ref={provided.innerRef}>
                                    {this.state.columns.map((item, index) => (
                                        <Draggable key={`${item.label}-columns-key`} draggableId={item.value} index={index}>
                                            {(provided, snapshot) => (
                                                <p
                                                    ref={provided.innerRef}
                                                    snapshot={snapshot}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                >
                                                    {item.label}
                                                </p>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </div>
                    <div style={{ flex: 1, backgroundColor: "#F8F9FA", padding: 20, borderRadius: 8, margin: "0.5em" }}>
                        <span class="mx-text loan-summary-headline text-semibold">Rows</span>
                        <Droppable droppableId="rows">
                            {(provided) => (
                                <div style={{ minHeight: "100%" }} {...provided.droppableProps} ref={provided.innerRef}>
                                    {this.state.rows.map((item, index) => (
                                        <Draggable key={`${item.label}-rows-key`} draggableId={item.value} index={index}>
                                            {(provided, snapshot) => (
                                                <p
                                                    ref={provided.innerRef}
                                                    snapshot={snapshot}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                >
                                                    {item.label}
                                                </p>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </div>
                    <div style={{ flex: 1, backgroundColor: "#F8F9FA", padding: 20, borderRadius: 8, margin: "0.5em" }}>
                        <span class="mx-text loan-summary-headline text-semibold">Filters</span>
                        <Droppable droppableId="filters">
                            {(provided) => (
                                <div style={{ minHeight: "100%" }} {...provided.droppableProps} ref={provided.innerRef}>
                                    {this.state.filters.map((item, index) => (
                                        <Draggable key={`${item.label}-filters-key`} draggableId={item.value} index={index}>
                                            {(provided, snapshot) => (
                                                <p
                                                    ref={provided.innerRef}
                                                    snapshot={snapshot}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                >
                                                    {item.label}
                                                </p>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </div>
                </div>
            </DragDropContext>
        );
    }
}
