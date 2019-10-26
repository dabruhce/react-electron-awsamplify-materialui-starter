import React, { Component } from 'react';
import { API, graphqlOperation, Auth, Hub } from "aws-amplify";
import { Authenticator, AmplifyTheme } from "aws-amplify-react";
import { withAuthenticator } from "aws-amplify-react";
import { getUser } from "./graphql/queries";
import { createUser } from "./graphql/mutations";
import AppRouter from "./routers/AppRouter";
import logo from './logo.svg';
import './App.css';

export const UserContext = React.createContext();

const theme = {
  ...AmplifyTheme,
  navBar: {
    ...AmplifyTheme.navBar,
    backgroundColor: "#ffc0cb"
  },
  button: {
    ...AmplifyTheme.button,
    backgroundColor: "var(--amazonOrange)"
  },
  sectionBody: {
    ...AmplifyTheme.sectionBody,
    padding: "5px"
  },
  sectionHeader: {
    ...AmplifyTheme.sectionHeader,
    backgroundColor: "var(--squidInk)"
  }
};



class App extends Component {

  state = {
    user: null,
    userAttributes: null
  };

  componentDidMount() {
    this.getUserData();
    Hub.listen("auth", this, "onHubCapsule");
  }

  getUserData = async () => {
    const user = await Auth.currentAuthenticatedUser();
    user
      ? this.setState({ user }, () => this.getUserAttributes(this.state.user))
      : this.setState({ user: null });
  };

  getUserAttributes = async authUserData => {
    const attributesArr = await Auth.userAttributes(authUserData);
    const attributesObj = Auth.attributesToObject(attributesArr);
    console.log(attributesObj)
    this.setState({ userAttributes: attributesObj });
  };

  onHubCapsule = capsule => {
    switch (capsule.payload.event) {
      case "signIn":
        console.log("signed in");
        this.getUserData();
        this.registerNewUser(capsule.payload.data);
        window.location.href = '/admin/user-profile'
        break;
      case "signUp":
        console.log("signed up");
        break;
      case "signOut":
        console.log("signed out");
        this.setState({ user: null });
        break;
      default:
        return;
    }
  };

  registerNewUser = async signInData => {
    const getUserInput = {
      id: signInData.signInUserSession.idToken.payload.sub
    };
    const { data } = await API.graphql(graphqlOperation(getUser, getUserInput));

    if (data.getUser) {
        window.location.href = '/admin/user-profile'
    }
    // if we can't get a user (meaning the user hasn't been registered before), then we execute registerUser
    if (!data.getUser) {
      try {
        const createUserInput = {
          ...getUserInput,
          name: signInData.username,
          email: signInData.signInUserSession.idToken.payload.email,
          auth0id: "auth0id" //,
    //      registered: true
        };
        const newUser = await API.graphql(
          graphqlOperation(createUser, { input: createUserInput })
        );
        console.log({ newUser });
      } catch (err) {
        console.error("Error registering new user", err);
      }
    }
  };

  handleSignout = async () => {
    try {
      await Auth.signOut();
    } catch (err) {
      console.error("Error signing out user", err);
    }
  };


  render() {
    const { user, userAttributes } = this.state;

    return !user ? (
      <Authenticator theme={theme} />
      ) : (
      <UserContext.Provider value={{ user, userAttributes }}>

        <AppRouter />

      </UserContext.Provider>
    );
  }
}

export default App

/*
export default withAuthenticator(App, {
  signUpConfig: {
    hiddenDefaults: ["phone_number"],
    signUpFields: [
      { label: "Name", key: "name", required: true, type: "string" }
    ]
}});
*/
