#!/usr/bin/env python
import argparse
import google.auth
import json
import sqlalchemy

from google.cloud.sql.connector import Connector
from google.auth.transport.requests import Request
from sqlalchemy import MetaData, Table
from sqlalchemy.orm import Session

# TODO: figure out how to get the username of the currently logged in user
IAM_USER = "clay.wood"

def populate_db(json_file):
    # get application default credentials of IAM user (current logged in user)
    credentials, project = google.auth.default()

    # refresh credentials if expired
    if not credentials.valid:
        request = Request()
        credentials.refresh(request)

    # initialize connector
    connector = Connector()

    # getconn now using IAM user and OAuth2 token as password
    def getconn():
        conn = connector.connect(
            "hcunits:us-central1:hcunits",
            "pymysql",
            user=IAM_USER,
            password=credentials.token,
            db="hcunits",  # log in to instance but don't connect to specific database
        )
        return conn

    # create connection pool
    engine = sqlalchemy.create_engine(
        "mysql+pymysql://",
        creator=getconn,
        future=True
    )

    table_name = json_file["table_name"]
    metadata_obj = MetaData()
    table = Table(table_name, metadata_obj, autoload_with=engine)
    for row in json_file["rows"]:
      row_as_tuple = [(k, v) for k, v in row.items()]
      print("Trying to insert or update %s=%s" % (row_as_tuple[0][0], row_as_tuple[0][1]))
      inserted = sqlalchemy.dialects.mysql.insert(table).values(row)

      # Convert the dict into a tuple to pass into the 'on_duplicate_key_update' func
      upserted = inserted.on_duplicate_key_update(row_as_tuple)

      # Connect to connection engine and execute within a single transaction.
      # This will fail to commit if you don't use a Session.
      with Session(engine) as session:
        session.execute(upserted)
        session.commit()
        print("Success!")

    # cleanup connector
    connector.close()


if __name__ == "__main__":
  parser = argparse.ArgumentParser()
  parser.add_argument("--filename", help="The JSON file from which to import the data", required=True)
  args = parser.parse_args()
  f = open(args.filename, "r")
  json_file = json.load(f)
  populate_db(json_file)