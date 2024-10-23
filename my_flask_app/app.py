from operator import truediv

from flask import Flask, render_template, request, redirect, url_for
import requests
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import yfinance as yf
from datetime import datetime, timedelta
import os


app = Flask(__name__)


@app.route('/')
def home():
    return render_template('index.html')


@app.route('/class_average_calculator')
def class_average_calculator():
    return render_template('class_average_calculator.html')  # Template for the calculator


@app.route('/calculate_average_calculator', methods=['POST'])
def calculate_average_calculator():
    scores = request.form['scores']
    score_list = [int(score.strip()) for score in scores.split(',') if score.strip()]
    average = sum(score_list) / len(score_list) if score_list else 0
    exam_percent = int(request.form['exam']) / 100
    ideal = int(request.form['ideal'])
    your_needed = (ideal - ((1 - exam_percent) * average)) / exam_percent

    return render_template('class_average_calculator.html', average=average, your_needed=your_needed)


@app.route('/investment_portfolio_display')
def investment_portfolio_display():
    return render_template('Investment Portfolio.html')


@app.route('/investment_portfolio', methods=['GET'])
def investment_portfolio():
    investments = request.args.get('investments', '')  # Use args.get for query parameters
    timeperiod = request.args.get('timeperiod', '')
    investments_list = [investment.strip() for investment in investments.split(',') if investment.strip()]
    alldata = []
    for item in investments_list:
        try:
            stock_data = get_stock_price(item)
            latest_timestamp = next(iter(stock_data))  # Get the first key (most recent time)
            latest_data = stock_data[latest_timestamp]
            alldata.append({
                'Symbol': item,
                'Time': latest_timestamp,
                'Open': latest_data['1. open'],
                'High': latest_data['2. high'],
                'Low': latest_data['3. low'],
                'Close': latest_data['4. close'],
                'Volume': latest_data['5. volume']
            })
        except KeyError:
            print(f"Data for {item} is not available...")
        except Exception as e:
            print(f"An error occurred while fetching data for {item}: {e}")

    return render_template('Investment Portfolio.html', alldata=alldata)




def get_stock_price(symbol):
    url = f'https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol={symbol}&interval=5min&apikey=QFZPU1WC5HF1G598'
    response = requests.get(url)
    data = response.json()
    return data.get(f'Time Series (5min)', {})  # Use .get to avoid KeyError

    

# Define the stock ticker (Apple in this case)
ticker = 'AAPL'

@app.route('/market_graph_display')
def Market_Graph_display():
    return render_template('market_graph.html',ticker='')

@app.route('/market_graph', methods = ['GET'])
def market_graph_ticker():
    # Create a ticker object
    ticker = request.args.get('ticker', '')
    if not ticker:
        return redirect(url_for('Market_Graph_display'))
    stock = yf.Ticker(ticker)

    # Calculate the date 5 years ago from today
    end_date = datetime.now()
    start_date = end_date - timedelta(days=5403)  # 5 years

    # Get historical data for the past 5 years
    hist_data = stock.history(start=start_date.strftime('%Y-%m-%d'), end=end_date.strftime('%Y-%m-%d'))

    # Display only the relevant columns (e.g., Date, Open, Close, Volume)
    selected_columns = hist_data[['Open', 'Close', 'Volume']]


    # Save to a temporary CSV file if needed
    csv_file = f'{ticker}_historical_data_5years.csv'
    selected_columns.to_csv(csv_file)

    with open(f'{ticker}_historical_data_5years.csv', "r") as file:
        date = []
        opener = []
        close = []
        volume = []
        next(file)
        for line in file:
            dataa = line.split(",")
            date.append(dataa[0])
            opener.append(float(dataa[1]))
            close.append(float(dataa[2]))
            volume.append(float(dataa[3]))

        grouped_lists = []
        grouped_lists_opener = []
        grouped_lists_close = []
        current_group = [date[0]]
        current_group_opener = [opener[0]]
        current_group_close =  [close[0]]
        current_reference = date[0][5:7]


        for i in range(1,len(date)):

            if date[i][5:7] == current_reference:
                current_group.append(date[i])
                current_group_opener.append(opener[i])
                current_group_close.append(close[i])
            else:
                grouped_lists.append(current_group)
                grouped_lists_opener.append(current_group_opener)
                grouped_lists_close.append(current_group_close)
                current_group = [date[i]]
                current_group_opener = [opener[i]]
                current_group_close = [close[i]]
                current_reference = date[i][5:7]

        grouped_lists.append(current_group)
        grouped_lists_opener.append(current_group_opener)
        grouped_lists_close.append(current_group_close)

    all_opener_caps = []
    all_close_caps = []
    for row in grouped_lists_opener:
        opener_cap = []
        for i in range(len(row)):
            ee = row[i] * volume[i]
            opener_cap.append(ee)
        all_opener_caps.append(opener_cap)
    for row in grouped_lists_close:
        close_cap = []
        for i in range(len(row)):
            ee = row[i] * volume[i]
            close_cap.append(ee)
        all_close_caps.append(close_cap)

    max_opens = []
    max_closes = []
    for row in all_opener_caps:
        max_opens.append(max(row))
    for row in all_close_caps:
        max_closes.append(max(row))

    max_cap_per_month = []
    for i in range(len(max_opens)):
        max_cap_per_month.append(max(max_opens[i],max_closes[i]))

    months = []
    for row in grouped_lists:
        months.append(row[0][0:7])
    plt.clf()
    plt.plot(months, max_cap_per_month, color="sienna")
    y_ticks = range(0, int(max(max_cap_per_month)) + 100_000_000_000, 100_000_000_000)
    plt.yticks(y_ticks)
    plt.xlabel("time")
    plt.ylabel("Dollar Value of Stock Traded (100bil)")
    plt.gca().set_xticks([])
    plt.savefig(os.path.join('static', f"market_{ticker}.png"))
    os.remove(f'{ticker}_historical_data_5years.csv')





    return render_template('market_graph.html', ticker = ticker)




if __name__ == '__main__':
    app.run(debug=True)

