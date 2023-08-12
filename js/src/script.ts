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

    //Get suggestions div
    const suggestions : HTMLDivElement = document.getElementById("suggestions") as HTMLDivElement || (() => {
        throw new Error("Could not find suggestions element");
    })();

    //Get the character guess container element
    const characterGuessContainer: HTMLElement = document.getElementById("guess-container") || (() => {
        throw new Error("Could not find guess-container element");
    })();


    //Get input element
    const input : HTMLInputElement = document.getElementById("guess-input") as HTMLInputElement || (() => {
        throw new Error("Could not find Guess input");
    })();



    //Temporary code to test the styling
    characterGuessContainer.insertAdjacentElement("afterbegin", CreateGuessDiv(dailyCharacter));
    characterGuessContainer.insertAdjacentElement("afterbegin", CreateGuessDiv(allCharacters[0]));
    characterGuessContainer.insertAdjacentElement("afterbegin", CreateGuessDiv(allCharacters[12]));
    //







    function DisplaySuggestions():void {

        const chars = GetSuggestions(input.value);

        

    }

    //Get all characters based on the input
    function GetSuggestions(value : string): Array<CharacterTypes.Character> {
        return allCharacters.filter(x => x.CharacterName.toLowerCase().startsWith(value.toLowerCase()));
    }

    //Create a div for the guess
    function CreateGuessDiv(character : CharacterTypes.Character): HTMLDivElement{

        const guessDiv : HTMLDivElement = document.createElement("div");
        guessDiv.classList.add("cell-container");


        //Change this to the actual image, this is just a placeholder
        guessDiv.insertAdjacentElement("beforeend", CreateGuessCell(character.CharacterName));
        

        //Can be Male and Female at the same time 
        guessDiv.insertAdjacentElement("beforeend", CreateGuessCell(character.Gender))?.classList.add(
            dailyCharacter.Gender.includes(character.Gender) ? 
                (dailyCharacter.Gender == character.Gender ? "correct" : "partial")
            : "incorrect"
            );

        guessDiv.insertAdjacentElement("beforeend", CreateGuessCell(character.Origin))?.classList.add(
            dailyCharacter.Origin == character.Origin ? "correct" : "incorrect"
            );

        guessDiv.insertAdjacentElement("beforeend", CreateGuessCell(character.Height.toString()))?.classList.add(
            dailyCharacter.Height == character.Height ? "correct" : "incorrect"
            );


        guessDiv.insertAdjacentElement("beforeend", CreateGuessCell(character.ReleaseYear.toString()))?.classList.add(
            ...dailyCharacter.ReleaseYear == character.ReleaseYear ? ["correct"] : 
            dailyCharacter.ReleaseYear > character.ReleaseYear ? ["incorrect","newer"] : ["incorrect","older"]
            );

        guessDiv.insertAdjacentElement("beforeend", CreateGuessCell(character.Difficulty.toString()))?.classList.add(
            dailyCharacter.Difficulty == character.Difficulty ? "correct" : "incorrect"
            );


        return guessDiv;
    }


    //Create a category cell with the value
    function CreateGuessCell(value : string) : HTMLDivElement{
        const cellDiv : HTMLDivElement = document.createElement("div");
        cellDiv.classList.add("cell", "border", "border-dark");
    
        const span : HTMLSpanElement = document.createElement("span");
        span.innerText = value;
        cellDiv.insertAdjacentElement("beforeend", span);
        return cellDiv;
    }


    onsubmit = (e) =>{
        e.preventDefault();
    }




    //Event listeners


    //Show suggestions on input focus
    input.addEventListener("focus", ()=>{
        suggestions.classList.toggle("disappear");
        suggestions.classList.toggle("d-flex");
    });

    //Hide suggestions on input blur
    input.addEventListener("blur", async ()=>{


        suggestions.classList.toggle('disappear');
        await setTimeout(() => {

            //Maybe change in the future
            suggestions.innerHTML = "";
            suggestions.classList.toggle("d-flex");
        },500 );
        
    });
});