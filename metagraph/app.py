import bittensor as bt
from flask import Flask, jsonify, request
from dotenv import load_dotenv
import os
load_dotenv()
app = Flask(__name__)

@app.route('/metagraph', methods=['GET'])
def get_status():
    metagraph = bt.metagraph(int(os.getenv('netuid')), network=os.getenv('network'))
    coldkeys = metagraph.coldkeys
    axons = metagraph.axons
    incentive_data = metagraph.incentive
    array_incentive_data = incentive_data.numpy()
    print(axons)
    print(array_incentive_data)
    return jsonify({ 'incentive_data': array_incentive_data.tolist(), 'coldkeys': coldkeys, 'axons': axons })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)