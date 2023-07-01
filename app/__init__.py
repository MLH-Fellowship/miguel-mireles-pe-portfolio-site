import os
from flask import Flask, render_template, request
from dotenv import load_dotenv
import folium
import json
from pathlib import Path

load_dotenv()
app = Flask(__name__)

def create_marker(location, color):
    marker = folium.Marker(
        location=[location['lat'], location['lon']],
        icon=folium.Icon(color=color, icon='circle-check', prefix='fa'),
        popup=folium.Popup(
            folium.IFrame(
                f'''
                <style>
                    h3 {{font-family: "Roboto", serif; text-align: center;}}
                    p {{font-family: "Roboto", serif; text-align: center;}}
                </style>
                <h3>{location['name']}</h3>
                <p>{location['description']}</p>
                ''',
                width=200,
                height=100
            )
        ),
        tooltip=location['name']
    )
    return marker

def create_map(members):
    map = folium.Map(min_zoom=2)

    for member in members:
        color = member['color']

        for location in member['locations']:
            marker = create_marker(location, color)
            marker.add_to(map)

    map.get_root().width = '100%'
    map.get_root().height = '100%'
    map_html = map.get_root()._repr_html_()
    return map_html

def load_member_data():
    locations_file_path = Path(__file__).resolve(
    ).parent / 'static' / 'data' / 'data.json'
    with open(locations_file_path, 'r') as f:
        data = json.load(f)
        members = data['members']
    return members

def load_member_hobby_data():
    hobby_file_path = Path(__file__).resolve().parent / 'static' / 'data' / 'hobbies.json'
    
    with open(hobby_file_path, 'r') as f:
        members_hobby_data = json.load(f)

    return members_hobby_data['members']

@app.route('/')
def index():
    members = load_member_data()

    map_html = create_map(members)
    
    return render_template('index.html', title="MLH Fellow", url=os.getenv("URL"), map=map_html, members=members)

@app.route('/hobbies')
def hobbies():
    members = load_member_data()
    
    return render_template('hobbies.html', title="Hobbies", url=os.getenv("URL"), members=members)
