import * as functions from "firebase-functions";
import { firebaseConfig } from "../config/firebase";

export const createMeetup = functions.https.onRequest((request, response) => {
  response.send("Hello from Firebase!");
 });
 