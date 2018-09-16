import React from 'react';
import ReactTable from "react-table";
import "react-table/react-table.css";
import moment from 'moment';

class Trades extends React.Component {
    render() {
        var trades = this.props.trades

        const tradeColumns = [{
            Header: 'type',
            accessor: 'order_type',
            width: 60,
            Cell: ({row}) => (
              <div>
                {row.order_type == 1 ?
                    <font color= "green"> BUY</font>
                    : <font color= "red"> SELL</font> }
              </div>
            )
        }, {
            Header: 'price',
            accessor: 'price',
            width: 130,
        }, {
            Header: 'ether',
            accessor: 'total',
            width: 130
        }, {
            Header: 'time',
            accessor: 'timestamp',
            width: 200,
            Cell: ({row}) => (
              <div>
                {moment.unix(row.timestamp).toDate().toUTCString() }
              </div>
            )
        }]

        return (
            <ReactTable
                data = {trades}
                columns = {tradeColumns}
            />
        )
    }
}

export default Trades
