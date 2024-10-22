from tokenize import group

import yfinance as yf
from datetime import datetime, timedelta
import os
import matplotlib.pyplot as plt

# Define the stock ticker (Apple in this case)
ticker = 'AMZN'
def main():

    make_file()
    listy()


def make_file():


    # Create a ticker object
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

def listy():
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
    plt.plot(months, max_cap_per_month, color = "sienna")
    y_ticks = range(0, int(max(max_cap_per_month)) + 100_000_000_000, 100_000_000_000)
    plt.yticks(y_ticks)
    plt.xlabel("time")
    plt.ylabel("Dollar Value of Stock Traded (100bil)")
    plt.gca().set_xticks([])
    plt.savefig(f"market for {ticker}")


main()




os.remove(f'{ticker}_historical_data_5years.csv')