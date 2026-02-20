# Models are custom data structues we use
# in our API for quereies and reponses.
from pydantic import BaseModel


# Landing Page Submission
class Submission(BaseModel):
    title: str
