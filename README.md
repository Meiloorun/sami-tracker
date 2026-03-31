# About this Project
I have a very cute cat. His name is Sami. I love him very dearly. However, he eats a lot. Sometimes, he gets fed, goes outside for a few minutes, comes back inside, pretends he's been out for a long time all day and then asks for more food. Insane, isn't it. Sometimes, he will be fed by someone, then will go and ask another person for food who may not know that he's been fed. 

What a cunning cat. Well, your reign of deception and lies ends here. 

## Introducing the  *Sami Tracker*
This is both an android app and website that allows for members of only my immediate family to create a log of whenever he's been fed, and when they next go to feed him, they can easily see when he's last been fed, with an indicator if he should be fed or not. 

<div style="text-align: center">
<img src="https://i.redd.it/m5z5t3j3jcsg1.png" width="1500">
</div>

You can also see the history of how much he's been fed daily.

<div style="text-align: center">
<img src="https://i.redd.it/kru1bow1kcsg1.png" height="700">
</div>

This way, we can never be fooled again.

### Feature List
- Email Onboarding for users that only I decide
- Show latest feedings of Sami
- Log Feedings of Sami, being able to set the time, date, what was fed and any other notes
- Being able to see the full history of what and when he was fed
- Be able to delete feedings from the history page, in case of any accidents
- Be able to sign out of a device
- Quick feed buttons that let you select the most common food that he is given, letting you log a feed much faster


### Usage
The only people that can use this app are my immediate family, therefore I directly control all the accounts and devices that can be used. :)

### Client
The Client is both a Web UI and Android App, powered by React Native and Expo. It builds an .apk upon release creation and attaches it, and on every push to the client, it will be deployed to the web page.

### Database
The Postgres database is hosted on Supabase managed by Drizzle ORM, accessible through the Express.js API which is being hosted on Render's Free version (which means it can take a few minutes for the backend to load).  

## Potential Future Improvements
- Once logging a feed, there should be a selectable box that should be selected if Sami has run out of food and we need to buy more. If this is selected, a notification should go out saying that he has run out and it should show on the front page with a button that confirms that his food has been bought and the notification can go away.   