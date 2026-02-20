# Models are custom data structues we use
# in our API for quereies and reponses.
from pydantic import BaseModel


class Submission(BaseModel):
    title: str
