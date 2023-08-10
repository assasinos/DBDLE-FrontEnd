import { CharacterTypes } from './types/character';
export {CharacterTypes};


document.addEventListener("DOMContentLoaded", async () => {



    //For local testing
    //Change it to the actual api host
    const apihost :string = "http://localhost:5203";




    //Get the daily character
    //This is a base64 encoded string so it's not easily readable
    const dailyCharacter: CharacterTypes.Character = JSON.parse(atob(await(await fetch(`${apihost}/api/Characters/GetDailyCharacter`)).json()));


    //Get all characters
    const allCharacters : Array<CharacterTypes.Character> = JSON.parse(await(await fetch(`${apihost}/api/Characters/GetAllCharacters`)).json())



});