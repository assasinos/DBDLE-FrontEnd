import { CharacterTypes } from "./types/character";
export { CharacterTypes };

document.addEventListener("DOMContentLoaded", async () => {
  //For local testing
  //Change it to the actual api host
  const apiHost: string = "http://localhost:5203";
  //Get the daily character
  //This is a base64 encoded string so it's not easily readable
  const dailyCharacterBase64 :string = await (await fetch(`${apiHost}/api/Characters/GetDailyCharacter`)).json()
  const dailyCharacter: CharacterTypes.Character = JSON.parse(
    atob(
      dailyCharacterBase64
    )
  );



  const last = localStorage.getItem("lastDailyCharacter") ?? localStorage.setItem("lastDailyCharacter", dailyCharacterBase64) ;
  if(last !== dailyCharacterBase64) {
    localStorage.setItem("lastDailyCharacter", dailyCharacterBase64);
    localStorage.setItem("guesses", "[]");
  }

  console.log(dailyCharacter);

  //Get all characters
  const allCharacters: Array<CharacterTypes.Character> = JSON.parse(
    await (await fetch(`${apiHost}/api/Characters/GetAllCharacters`)).json()
  );

  //Get suggestions div
  const suggestions: HTMLDivElement =
    (document.getElementById("suggestions") as HTMLDivElement) ||
    (() => {
      throw new Error("Could not find suggestions element");
    })();

  //Get the character guess container element
  const characterGuessContainer: HTMLElement =
    document.getElementById("guess-container") ||
    (() => {
      throw new Error("Could not find guess-container element");
    })();

  //Get input element
  const input: HTMLInputElement =
    (document.getElementById("guess-input") as HTMLInputElement) ||
    (() => {
      throw new Error("Could not find Guess input");
    })();

    const guesses = localStorage.getItem("guesses") ?? "[]";

    const guessesArray : Array<CharacterTypes.Character> = JSON.parse(guesses);
  
    let numberOfTries :number = guessesArray.length;
  
    guessesArray.forEach(guess => {
      AddGuess(guess,false);
    });


  //Get all characters based on the input
  function GetSuggestions(value: string): Array<CharacterTypes.Character> {
    return allCharacters.filter((x) =>
      x.CharacterName.toLowerCase().startsWith(value.toLowerCase())
    );
  }

  //Create a div for the guess
  function CreateGuessDiv(character: CharacterTypes.Character, animation : boolean): void {

    //TODO: Implement animation
    const guessDiv: HTMLDivElement = document.createElement("div");
    guessDiv.classList.add("cell-container");
    
    guessDiv.insertAdjacentElement("beforeend", CreateGuessCellImg(character.Image.ImagePath, character.CharacterName));

    characterGuessContainer.insertAdjacentElement("afterbegin", guessDiv);


    //Placeholders
    for (let i = 0; i < 5; i++)
    {
      guessDiv.insertAdjacentElement("beforeend", CreateGuessCell(""));
    }



    
    //Can be Male and Female at the same time

    guessDiv.replaceChild(CreateGuessCell(character.Gender),guessDiv.childNodes[1]);

    guessDiv.children[1]?.classList.add(
        (dailyCharacter.Gender.includes(character.Gender) || character.Gender.includes(dailyCharacter.Gender))
          ? dailyCharacter.Gender === character.Gender ? "correct" : "partial"
          : "incorrect",
          "reveal"
      );

      setTimeout(() => {
        guessDiv.replaceChild(CreateGuessCell(character.Origin),guessDiv.childNodes[2]);
        guessDiv.children[2]
        ?.classList.add(
          dailyCharacter.Origin == character.Origin ? "correct" : "incorrect",
          "reveal"
        );
      }, 500);


      setTimeout(() => {
        guessDiv.replaceChild(CreateGuessCell(character.Height.toString()),guessDiv.childNodes[3]);

        guessDiv.children[3]
        ?.classList.add(
          dailyCharacter.Height == character.Height ? "correct" : "incorrect",
          "reveal"
        );
      }, 1000);


      setTimeout(() => {
        guessDiv.replaceChild(CreateGuessCell(character.ReleaseYear.toString()),guessDiv.childNodes[4]);

        guessDiv.children[4]
        ?.classList.add(
          ...(dailyCharacter.ReleaseYear == character.ReleaseYear
            ? ["correct"]
            : dailyCharacter.ReleaseYear > character.ReleaseYear
            ? ["incorrect", "newer"]
            : ["incorrect", "older"]),
            "reveal"
        );
      }, 1500);

      setTimeout(() => {
      guessDiv.replaceChild(CreateGuessCell(character.Difficulty.toString()),guessDiv.childNodes[5]);

      guessDiv.children[5]
        ?.classList.add(
          dailyCharacter.Difficulty == character.Difficulty
            ? "correct"
            : "incorrect",
            "reveal"
        );
      }, 2000);


  }

  //Create a category cell with the value
  function CreateGuessCell(value: string): HTMLDivElement {
    const cellDiv: HTMLDivElement = document.createElement("div");
    cellDiv.classList.add("cell", "border", "border-dark");

    const span: HTMLSpanElement = document.createElement("span");
    span.innerText = value;
    cellDiv.insertAdjacentElement("beforeend", span);
    return cellDiv;
  }

  function GreateSuggestionDiv(character : CharacterTypes.Character):HTMLDivElement{
    const suggestionDiv: HTMLDivElement = document.createElement("div");
    suggestionDiv.classList.add("suggestion");

    const img: HTMLImageElement = document.createElement("img");
    img.src = "/assets/" + character.Image.ImagePath;
    img.alt = character.CharacterName;
    suggestionDiv.insertAdjacentElement("beforeend", img);

    const span: HTMLSpanElement = document.createElement("span");
    span.innerText = character.CharacterName;
    suggestionDiv.insertAdjacentElement("beforeend", span);



    return suggestionDiv;

  }

  //Create a category cell with the image
  function CreateGuessCellImg(src: string, characterName :string ): HTMLDivElement {
    const cellDiv: HTMLDivElement = document.createElement("div");
    cellDiv.classList.add("cell", "border", "border-dark");

    const img: HTMLImageElement = document.createElement("img");
    img.src = "/assets/" + src;
    img.alt = characterName;
    cellDiv.insertAdjacentElement("beforeend", img);
    return cellDiv;
  }

  function AddGuess(character :CharacterTypes.Character, persistence : boolean = true) : void {
    if(persistence) {
      numberOfTries++;
      const storage = localStorage.getItem("guesses");
      const guesses = storage ? JSON.parse(storage) : [];
      guesses.push(character);
      localStorage.setItem("guesses", JSON.stringify(guesses));
      input.value = "";
      suggestions.innerHTML = "";
      input.blur();
    }

    CreateGuessDiv(character, persistence);

    // characterGuessContainer.insertAdjacentElement(
    //   "afterbegin",
      
    // );
    allCharacters.splice(allCharacters.indexOf(character), 1);
    
    if(character.CharacterName === dailyCharacter.CharacterName) {
      


      const modal = CreateWinModal(dailyCharacter, numberOfTries);
      document.body.appendChild(modal);
      
    }
  }



  //Create the winning modal 

  //TODO: Make it prettier 
  function CreateWinModal(character : CharacterTypes.Character, numberOfTries : number): HTMLDialogElement {
    const dialogElement: HTMLDialogElement = document.createElement("dialog");
    dialogElement.id = "winmodal";
    dialogElement.setAttribute("open","");
    dialogElement.classList.add("card", "text-center");


    const cardBody: HTMLDivElement = document.createElement("div");
    cardBody.classList.add("card-body", "d-flex", "flex-column", "align-items-center", "gap-4");

    const title: HTMLHeadingElement = document.createElement("h2");
    title.classList.add("card-title");
    title.textContent = "gg You Win!";
    cardBody.appendChild(title);

    const characterInfo: HTMLDivElement = document.createElement("div");
    const characterImage: HTMLImageElement = document.createElement("img");
    characterImage.src = `/assets/${character.Image.ImagePath}`;
    characterImage.alt = character.CharacterName;
    characterInfo.appendChild(characterImage);

    const characterName: HTMLSpanElement = document.createElement("span");
    characterName.innerHTML = `You guessed: <span class="fw-bold fs-2">${character.CharacterName}</span>`;
    characterInfo.appendChild(characterName);
    cardBody.appendChild(characterInfo);

    const description: HTMLParagraphElement = document.createElement("p");
    description.classList.add("card-text");
    description.textContent = `You guessed the character in ${numberOfTries} guesses!`;
    cardBody.appendChild(description);

    dialogElement.appendChild(cardBody);

    return dialogElement;
}


  //Add the guess
  onsubmit = (e) => {
    e.preventDefault();



    const characters = GetSuggestions(input.value);
    if(characters.length < 1) return;

    AddGuess(characters[0]);

  };

  //Event listeners

  //Show suggestions on input focus
  input.addEventListener("focus", () => {
    suggestions.classList.toggle("disappear");
    suggestions.classList.toggle("d-flex");
  });

  //Hide suggestions on input blur
  input.addEventListener("blur", async () => {
    suggestions.classList.toggle("disappear");
    await setTimeout(() => {
      suggestions.classList.toggle("d-flex");
    }, 500);
  });

  input.addEventListener("input", (e) => {

    if(input.value.length < 1) 
    {
      suggestions.innerHTML = "";
      return;
    }
    const characters  = GetSuggestions(input.value);

    suggestions.innerHTML = "";

    //Change so the suggestions are not flickering
    characters.forEach(element => {
      
    
      const suggestion = GreateSuggestionDiv(element);

      suggestion.addEventListener("click", () => {
        AddGuess(element);
      });

      suggestions.insertAdjacentElement("beforeend",suggestion);
    });
      

  });


});
