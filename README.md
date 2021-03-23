# Alvin's Calculator for Sezzle Coding Challenge

## Description
This is a calculator that can do basic arithmetic operations. Implements websockets to allow different users to see live calculations made. Any calculation made by a user will be seen by other users in the "Calculator logs" section.

Uses Flask backend, with html/css & javascript for the frontend. Hosted on heroku since it is free and simple to set up.
## How to run

I have a live deployment at https://calculator-alvin.herokuapp.com/. If you want to run my code locally:

1. Clone the repo
2. Make sure you have pipenv installed
3. Run pipenv install to get all the dependencies
4. Run pipenv shell
5. Inside the shell, run "heroku local dev"

**NOTE: Local version might have some bugs that live deployment version does not. Might be something to do with websockets... did not have the time to investigate fully.

**NOTE2: I excluded the .env file since it contains my private redis heroku key. You can create your own .env, and include the following lines:

```
FLASK_ENV=development

FLASK_APP=server.py 

REDIS_URL=<your_key>. 
```
If this is a problem, you can contact me at gooi0002@umn.edu. Do also contact me for any feedback/improvements/bugs. Thanks for your time and have a good day!

### Bugs
- Pressing the equal button consecutively does not continue the previous operation. 

  eg: 4 + 5 = 10, = 15, = 20 ....


