# test_db.py

import unittest
from peewee import *

from app import TimelinePost
from playhouse.shortcuts import model_to_dict

MODELS = [TimelinePost]

# use an in-memory SQLite for tests.
test_db = SqliteDatabase(':memory:')

class TestTimelinePost(unittest.TestCase):
    def setUp(self):
        # Bind model classes to test db. Since we have a complete list of
        # all models, we do not need to recursively bind dependencies.
        test_db.bind(MODELS, bind_refs=False, bind_backrefs=False)

        test_db.connect()
        test_db.create_tables(MODELS)

    def tearDown(self):
        # Not strictly necessary since SQLite in-memory databases only live
        # for the duration of the connection, and in the next step we close
        # the connection...but a good practice all the same.
        test_db.drop_tables(MODELS)

        # Close connection to db.
        test_db.close()

    def test_timeline_post(self):
        # Verify there are 0 timeline posts
        total = TimelinePost.select()
        assert len(total) == 0
        
        # Create 2 timeline posts.
        first_post = TimelinePost.create(name='John Doe', email='john@example.com', content='Hello World, I\'m John!')
        assert first_post.id == 1
        second_post = TimelinePost.create(name='Jane Doe', email='jane@example.com', content='Hello World, I\'m Jane!')
        assert second_post.id == 2
        
        # Get timeline posts and assert that they are correct
        first = TimelinePost.get(TimelinePost.id == 1)
        assert first.name == 'John Doe'
        assert first.email == 'john@example.com'
        assert first.content == 'Hello World, I\'m John!'
        
        second = TimelinePost.get(TimelinePost.id == 2)
        assert second.name == 'Jane Doe'
        assert second.email == 'jane@example.com'
        assert second.content == 'Hello World, I\'m Jane!'
        
        # Verify there are 2 timeline posts
        total = TimelinePost.select()
        assert len(total) == 2
        
        # Delete timeline post and verify only 1 left
        second.delete_instance()
        total = TimelinePost.select()
        assert len(total) == 1
        
        # Delete last timeline post and verify none are left
        first.delete_instance()
        total = TimelinePost.select()
        assert len(total) == 0