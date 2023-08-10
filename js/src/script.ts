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


    //Get the character guess container element
    const characterGuessContainer: HTMLElement = document.getElementById("guess-container") || (() => {
        throw new Error("Could not find guess-container element");
    })();


    //Temporary code to test the styling
    characterGuessContainer.insertAdjacentElement("beforeend", CreateGuessDiv(dailyCharacter));







    function CreateGuessDiv(character : CharacterTypes.Character): HTMLDivElement{

        const guessDiv : HTMLDivElement = document.createElement("div");
        guessDiv.classList.add("cell-container");


        //Change this to the actual image, this is just a placeholder
        guessDiv.insertAdjacentElement("beforeend", CreateGuessCell(character.CharacterName));
        
        guessDiv.insertAdjacentElement("beforeend", CreateGuessCell(character.Gender));

        guessDiv.insertAdjacentElement("beforeend", CreateGuessCell(character.Origin));

        guessDiv.insertAdjacentElement("beforeend", CreateGuessCell(character.Height.toString()));

        guessDiv.insertAdjacentElement("beforeend", CreateGuessCell(character.ReleaseYear.toString()));

        guessDiv.insertAdjacentElement("beforeend", CreateGuessCell(character.Difficulty.toString()));


        return guessDiv;
    }

    function CreateGuessCell(value : string) : HTMLDivElement{
        const cellDiv : HTMLDivElement = document.createElement("div");
        cellDiv.classList.add("cell", "border", "border-dark");
    
        const span : HTMLSpanElement = document.createElement("span");
        span.innerText = value;
        cellDiv.insertAdjacentElement("beforeend", span);
        return cellDiv;
    }

});