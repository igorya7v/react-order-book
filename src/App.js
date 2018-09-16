import React, { Component } from 'react';
import OrderBook from './Components/OrderBook';
import Trades from './Trades';
import SplitPane from 'react-split-pane';
import ReactScrollbar from 'react-scrollbar-js';
import './App.css';
import moment from 'moment';


class App extends Component {

  constructor() {
    super();
    this.state = {
      instrument: "No Name",
      baseAskOrders: [],
      baseBidOrders: [],
      askOrders: [],
      bidOrders: [],
      trades: [],
      gotoText: 0,
      forwardText: 0,
      currentTime: 0,
      sellDecimalPlaces: 8,
      buyDecimalPlaces: 8
    };

    this.handleGoTo = this.handleGoTo.bind(this);
    this.handleForward = this.handleForward.bind(this);
    this.handleBackward = this.handleBackward.bind(this);

    this.handleGotoTxt = this.handleGotoTxt.bind(this);
    this.handleForwardTxt = this.handleForwardTxt.bind(this);

    this.handleSellDecimalPlaces = this.handleSellDecimalPlaces.bind(this);
    this.handleBuyDecimalPlaces = this.handleBuyDecimalPlaces.bind(this);
  }

  precisionRound(number, precision) {
      var shift = function (number, exponent) {
          var numArray = ("" + number).split("e")
          return +(numArray[0] + "e" + (numArray[1] ? (+numArray[1] + exponent) : exponent))
      }

      return shift(Math.round(shift(number, +precision)), -precision)
  }

  handleTradesData(tradesData) {
      this.setState({
          trades: tradesData
      })
  }

  handleData(rawData) {
    //console.log(rawData['timestamp'])
    let data = rawData;
    if (data.error) {
        console.log("error: " + data.error)
        return;
    }

    let orderData = rawData;
    let askOrders = orderData.Sell.map(ask => ({
      price:ask.Price,
      quantity: ask.Total
    }));

    let aggAskOrders = this.aggregate(askOrders, this.state.sellDecimalPlaces)

    let bidOrders = orderData.Buy.map(bid => ({
      price: bid.Price,
      quantity: bid.Total
    }));

    let aggBidOrders = this.aggregate(bidOrders, this.state.buyDecimalPlaces)

    this.setState({
        currentTime: moment.unix(rawData['timestamp']).toDate().toUTCString(),
        baseAskOrders: askOrders,
        baseBidOrders: bidOrders,
        askOrders: aggAskOrders,
        bidOrders: aggBidOrders,
        instrument: rawData['Market']
    });
  }

  aggregate(data, decimalPlaces) {
      let dict = {}
      for(var i=0; i < data.length; i++){
          let value = this.precisionRound(data[i].price, decimalPlaces)
          if(value in dict){
              dict[value] = dict[value] + data[i].quantity
          } else {
              dict[value] = data[i].quantity
          }
      }

      let aggBidOrders = []
      for (var key in dict) {
          aggBidOrders.push({ price: parseFloat(key), quantity: this.precisionRound(dict[key], 8) })
      }

      return aggBidOrders
  }

  componentDidMount() {
      this.setState({gotoText: 1533340800})
      this.getData(1533340800)
  }

  getData(time) {
      fetch("http://localhost:5000/orderbook/5322/" + time)
      .then(response => response.json())
      .then(data => {
          this.handleData(data)
      })

      fetch("http://localhost:5000/trades/5322/0/" + time)
      .then(response => response.json())
      .then(data => {
          this.handleTradesData(data)
      })
  }

  handleGoTo() {
      this.getData(this.state.gotoText)
  }

  handleForward() {
      let newGoto = parseInt(this.state.gotoText) + parseInt(this.state.forwardText)
      this.setState({gotoText: newGoto})
      this.getData(newGoto)
  }

  handleBackward() {
      let newGoto = parseInt(this.state.gotoText) - parseInt(this.state.forwardText)
      this.setState({gotoText: newGoto})
      this.getData(newGoto)
  }

  handleGotoTxt(event) {
      this.setState({gotoText: event.target.value})
  }

  handleForwardTxt(event) {
      this.setState({forwardText: event.target.value})
  }

  handleSellDecimalPlaces(event) {
      this.setState({sellDecimalPlaces: event.target.value})
      let aggAskOrders = this.aggregate(this.state.baseAskOrders, event.target.value)
      this.setState({askOrders: aggAskOrders})
  }

  handleBuyDecimalPlaces(event) {
      this.setState({buyDecimalPlaces: event.target.value})
      let aggBidOrders = this.aggregate(this.state.baseBidOrders, event.target.value)
      this.setState({bidOrders: aggBidOrders})
  }

  render() {

      const myScrollbar = {
      width: 800,
      height: 800,
    }

    return (
        <div>
            <div className="row">
                <h1 className="instrument">{this.state.instrument}</h1>
                <input type="text" value={this.state.currentTime} />
                <button onClick={this.handleGoTo}>
                    Go To:
                </button>
                <input type="text" value={this.state.gotoText} onChange={this.handleGotoTxt} />
                <button onClick={this.handleBackward}>
                    Backward:
                </button>
                <input type="text" value={this.state.forwardText} onChange={this.handleForwardTxt} />
                <button onClick={this.handleForward}>
                    Forward:
                </button>
                Sell decimal places:
                <input type="text" value={this.state.sellDecimalPlaces} onChange={this.handleSellDecimalPlaces} />
                Buy decimal places:
                <input type="text" value={this.state.buyDecimalPlaces} onChange={this.handleBuyDecimalPlaces} />
            </div>
            <SplitPane split="vertical" defaultSize="45%">
                <div>
                    <ReactScrollbar style={myScrollbar}>
                        <div className="App">
                            <OrderBook askOrders={this.state.askOrders} bidOrders={this.state.bidOrders} />
                        </div>
                    </ReactScrollbar>
                </div>

                <div>
                    <ReactScrollbar style={myScrollbar}>
                        <Trades trades = {this.state.trades} />
                    </ReactScrollbar>
                </div>
           </SplitPane>
       </div>

    );
  }
}

export default App;
