from peewee import *
import os
from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv
import folium
import json
import datetime
from playhouse.shortcuts import model_to_dict
from pathlib import Path
import regex
import random

load_dotenv('./example.env')

app = Flask(__name__)

if os.getenv("TESTING") == "true":
    print("Running in test mode")
    mydb = SqliteDatabase('file:memory?mode=memory&cache=shared',
                        uri=True)
else:
    mydb = MySQLDatabase(
        os.getenv("MYSQL_DATABASE"),
        user=os.getenv("MYSQL_USER"),
        password=os.getenv("MYSQL_PASSWORD"),
        host=os.getenv("MYSQL_HOST"),
        port=3306
    )

class TimelinePost(Model):
    name = CharField()
    email = CharField()
    content = TextField()
    created_at = DateTimeField(default=datetime.datetime.now)

    class Meta:
        database = mydb

mydb.connect()
mydb.create_tables([TimelinePost])

@app.teardown_appcontext
def close_db(exeption):
    if not mydb.is_closed():
        mydb.close()

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
    random_start_location = random.choice(members)['locations'][0]
    map = folium.Map(
        location=[random_start_location['lat'], random_start_location['lon']],
        zoom_start=2,
        tiles='Stamen Terrain'
    )

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

@app.route('/timeline')
def timeline():
    timeline_posts = TimelinePost.select().order_by(TimelinePost.created_at.desc())

    return render_template('timeline.html', title="Timeline", url=os.getenv("URL"), posts=timeline_posts)

# Malformed timeline post error handling
def validate_form_input(input_value, error_message, validation_regex):
    if not regex.match(validation_regex, input_value):  # Use regex.match
        return error_message
    return None

def validate_name(name):
    if not name:
        return 'Invalid name'
    name_regex = r'^[\p{L}\p{M}]+(?:\p{Zs}[\p{L}\p{M}]+)*$|^[\p{L}\p{M}]+$'
    return validate_form_input(name, 'Invalid name', name_regex)

def validate_email(email):
    if not email:
        return 'Invalid email'
    email_regex = r'^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$'
    return validate_form_input(email, 'Invalid email', email_regex)

def validate_content(content):
    if not content:
        return 'Invalid content'
    return validate_form_input(content, 'Invalid content', r'.+')

@app.route('/api/timeline_post', methods=['POST'])
def post_time_line_post():
    name = request.form.get('name')
    email = request.form.get('email')
    content = request.form.get('content')

    validation_errors = {}

    name_error = validate_name(name)
    email_error = validate_email(email)
    content_error = validate_content(content)

    if name_error:
        validation_errors['name'] = name_error
    if email_error:
        validation_errors['email'] = email_error
    if content_error:
        validation_errors['content'] = content_error
    
    if validation_errors:
        return jsonify(request_errors=validation_errors), 400

    timeline_post = TimelinePost.create(name=name, email=email, content=content)

    return model_to_dict(timeline_post), 200

@app.route('/api/timeline_post', methods=['GET'])
def get_time_line_post():
    return {
        'timeline_posts' : [
            model_to_dict(p)
            for p in TimelinePost.select().order_by(TimelinePost.created_at.desc())
        ]
    }, 200

@app.route('/api/timeline_post/<id>', methods=['DELETE'])
def delete_time_line_post(id):
    try:
        timeline_post = TimelinePost.get_by_id(id)
        timeline_post.delete_instance()
        return f"Successfully deleted timeline post with id {id}\n", 200
    except TimelinePost.DoesNotExist:
        return f"Timeline post with id {id} does not exist\n", 404
    except Exception as e:
        return f"An error occurred while deleting the timeline post: {str(e)}\n", 500