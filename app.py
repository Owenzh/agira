# -*- coding: utf-8 -*-

from scripts import tabledef
from scripts import forms
from scripts import helpers
from flask import Flask, redirect, url_for, render_template, request, session, send_from_directory
import json
import sys
import os


app = Flask(__name__)


# ======== Routing =========================================================== #
@app.route('/favicon.ico')
def favicon():
    return send_from_directory(os.path.join(app.root_path, 'static'), 'favicon.ico', mimetype='image/vnd.microsoft.icon')

# -------- Login ------------------------------------------------------------- #
@app.route('/', methods=['GET', 'POST'])
def home():
    return render_template('home.html')
  
# -------- Data API ---------------------------------------------------------- #
@app.route('/api/chart/<type>', methods=['GET', 'POST'])
def charts(type):
    return type + ' back'

# ======== Main ============================================================== #
if __name__ == "__main__":
    app.secret_key = os.urandom(12)  # Generic key for dev purposes only
    app.run(debug=True, use_reloader=True)
