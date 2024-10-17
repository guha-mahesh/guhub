from flask import Flask, render_template, request, redirect, url_for
import pandas as pd
import requests

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
    url = f'Procfile'
    response = requests.get(url)

    # Handle potential response issues
    if response.status_code != 200:
        print(f"Error fetching data for {symbol}: {response.status_code}")
        return {}

    data = response.json()
    return data.get('Time Series (5min)', {})  # Use .get to avoid KeyError


if __name__ == '__main__':
    app.run(debug=True)
