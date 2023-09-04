import { CharacterTypes } from "./types/character";
export { CharacterTypes };

document.addEventListener("DOMContentLoaded", async () => {
  //For local testing
  //Change it to the actual api host
  const apiHost: string = "http://localhost:5203";

  const dailyCharacterBase64 =
    (await GetDailyCharacterString()) ??
    FetchError("We couldn't get the daily character. ")!;
  //Get the daily character
  //This is a base64 encoded string so it's not easily readable
  const dailyCharacter: CharacterTypes.Character = JSON.parse(
    atob(dailyCharacterBase64)
  );

  //Check if the daily character has changed
  const last =
    localStorage.getItem("lastDailyCharacter") ??
    localStorage.setItem("lastDailyCharacter", dailyCharacterBase64);
  if (last !== dailyCharacterBase64) {
    localStorage.setItem("lastDailyCharacter", dailyCharacterBase64);
    localStorage.setItem("guesses", "[]");
  }

  //Get all characters
  const allCharacters: Array<CharacterTypes.Character> =
    (await GetAllCharacters()) ??
    FetchError("We couldn't get the characters. ")!;

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

  //Get the guesses from local storage
  const guesses = localStorage.getItem("guesses") ?? "[]";

  const guessesArray: Array<CharacterTypes.Character> = JSON.parse(guesses);

  let numberOfTries: number = guessesArray.length;

  //Create input element
  const inputElement: HTMLInputElement = document.createElement("input");
  inputElement.type = "text";
  inputElement.placeholder = "Enter Character Name";
  inputElement.classList.add("form-control");

  //Create submit button
  const submitButton: HTMLInputElement = document.createElement("input");
  submitButton.type = "submit";
  submitButton.value = "Guess";
  submitButton.classList.add("btn", "btn-outline-primary");

  //Add the previous guesses to the page
  await Promise.all(
    guessesArray.map(async (guess) => {
      await AddGuess(guess, false);
    })
  );

  //Maybe change to React project in the future

  //Insert input and submit button into the form
  const inputGroup: HTMLElement =
    document.getElementById("input-div") ??
    (() => {
      throw new Error("Could not find input-div element");
    })();

  //clear the input group
  inputGroup.innerHTML = "";

  inputGroup.insertAdjacentElement("beforeend", inputElement);
  inputGroup.insertAdjacentElement("beforeend", submitButton);

  //Get all characters based on the input
  function GetSuggestions(value: string): Array<CharacterTypes.Character> {
    return allCharacters.filter((x) =>
      x.CharacterName.toLowerCase().startsWith(value.toLowerCase())
    );
  }

  function delay(milliseconds: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, milliseconds);
    });
  }

  //Create a div for the guess
  async function CreateGuessDiv(
    character: CharacterTypes.Character,
    animation: boolean
  ): Promise<void> {
    const guessDiv: HTMLDivElement = document.createElement("div");
    guessDiv.classList.add("cell-container");

    guessDiv.insertAdjacentElement(
      "beforeend",
      CreateGuessCellImg(character.Image.ImagePath, character.CharacterName)
    );

    characterGuessContainer.insertAdjacentElement("afterbegin", guessDiv);

    //Placeholders
    for (let i = 0; i < 5; i++) {
      guessDiv.insertAdjacentElement("beforeend", CreateGuessCell(""));
    }

    //Can be Male and Female at the same time

    guessDiv.replaceChild(
      CreateGuessCell(character.Gender),
      guessDiv.childNodes[1]
    );

    guessDiv.children[1]?.classList.add(
      dailyCharacter.Gender.includes(character.Gender) ||
        character.Gender.includes(dailyCharacter.Gender)
        ? dailyCharacter.Gender === character.Gender
          ? "correct"
          : "partial"
        : "incorrect",
      "reveal"
    );
    await delay(500);

    guessDiv.replaceChild(
      CreateGuessCell(character.Origin),
      guessDiv.childNodes[2]
    );
    guessDiv.children[2]?.classList.add(
      dailyCharacter.Origin == character.Origin ? "correct" : "incorrect",
      "reveal"
    );
    await delay(500);

    guessDiv.replaceChild(
      CreateGuessCell(character.Height.toString()),
      guessDiv.childNodes[3]
    );

    guessDiv.children[3]?.classList.add(
      dailyCharacter.Height == character.Height ? "correct" : "incorrect",
      "reveal"
    );

    await delay(500);
    guessDiv.replaceChild(
      CreateGuessCell(character.ReleaseYear.toString()),
      guessDiv.childNodes[4]
    );

    guessDiv.children[4]?.classList.add(
      ...(dailyCharacter.ReleaseYear == character.ReleaseYear
        ? ["correct"]
        : dailyCharacter.ReleaseYear > character.ReleaseYear
        ? ["incorrect", "newer"]
        : ["incorrect", "older"]),
      "reveal"
    );
    await delay(500);

    guessDiv.replaceChild(
      CreateGuessCell(character.Difficulty.toString()),
      guessDiv.childNodes[5]
    );

    guessDiv.children[5]?.classList.add(
      dailyCharacter.Difficulty == character.Difficulty
        ? "correct"
        : "incorrect",
      "reveal"
    );
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

  function GreateSuggestionDiv(
    character: CharacterTypes.Character
  ): HTMLDivElement {
    const suggestionDiv: HTMLDivElement = document.createElement("div");
    suggestionDiv.classList.add("suggestion");

    const img: HTMLImageElement = document.createElement("img");
    img.src = "assets/" + character.Image.ImagePath;
    img.alt = character.CharacterName;
    suggestionDiv.insertAdjacentElement("beforeend", img);

    const span: HTMLSpanElement = document.createElement("span");
    span.innerText = character.CharacterName;
    suggestionDiv.insertAdjacentElement("beforeend", span);

    return suggestionDiv;
  }

  //Create a category cell with the image
  function CreateGuessCellImg(
    src: string,
    characterName: string
  ): HTMLDivElement {
    const cellDiv: HTMLDivElement = document.createElement("div");
    cellDiv.classList.add("cell", "border", "border-dark");

    //Name overlay
    const characterNameSpan: HTMLSpanElement = document.createElement("span");
    characterNameSpan.innerText = characterName;
    characterNameSpan.classList.add("text-overlay", "d-none");
    cellDiv.insertAdjacentElement("beforeend", characterNameSpan);

    const img: HTMLImageElement = document.createElement("img");
    img.src = "assets/" + src;
    img.alt = characterName;

    //Show the name on hover
    let hideTimeout: NodeJS.Timeout;

    img.addEventListener("mouseover", () => {
      characterNameSpan.classList.remove("d-none");
      clearTimeout(hideTimeout);
    });

    img.addEventListener("mouseleave", () => {
      hideTimeout = setTimeout(() => {
        characterNameSpan.classList.add("d-none");
      }, 10);
    });

    characterNameSpan.addEventListener("mouseover", () => {
      clearTimeout(hideTimeout);
    });

    characterNameSpan.addEventListener("mouseleave", () => {
      characterNameSpan.classList.add("d-none");
    });
    cellDiv.insertAdjacentElement("beforeend", img);

    return cellDiv;
  }

  async function AddGuess(
    character: CharacterTypes.Character,
    persistence: boolean = true
  ): Promise<void> {
    //If the character is send by previous guesses
    inputElement.disabled = true;
    submitButton.disabled = true;
    if (persistence) {
      numberOfTries++;
      const storage = localStorage.getItem("guesses");
      const guesses = storage ? JSON.parse(storage) : [];
      guesses.push(character);
      localStorage.setItem("guesses", JSON.stringify(guesses));
      inputElement.value = "";
      suggestions.innerHTML = "";
      inputElement.blur();
    }

    //Remove the character from the list
    const characterIndex = allCharacters.findIndex(
      (char: CharacterTypes.Character) => {
        return char.CharacterName === character.CharacterName;
      }
    );
    allCharacters.splice(characterIndex, 1);

    await CreateGuessDiv(character, persistence);

    //Check if the character is the daily character
    if (character.CharacterName === dailyCharacter.CharacterName) {
      const modal = await CreateWinModal(dailyCharacter, numberOfTries);
      document.body.querySelector("main")?.appendChild(modal);
      modal.scrollIntoView();

      //Block the input
      inputElement.disabled = true;

      //block the submit
      submitButton.disabled = true;
      return;
    }
    inputElement.disabled = false;
    submitButton.disabled = false;
  }

  //Create the winning modal

  //TODO: Make it prettier
  async function CreateWinModal(
    character: CharacterTypes.Character,
    numberOfTries: number
  ): Promise<HTMLDialogElement> {
    const dialogElement: HTMLDialogElement = document.createElement("dialog");
    dialogElement.id = "winmodal";
    dialogElement.setAttribute("open", "");
    dialogElement.classList.add("card", "text-center");

    const cardBody: HTMLDivElement = document.createElement("div");
    cardBody.classList.add(
      "card-body",
      "d-flex",
      "flex-column",
      "align-items-center",
      "gap-4"
    );

    const title: HTMLHeadingElement = document.createElement("h2");
    title.classList.add("card-title");
    title.textContent = "gg You Win!";
    cardBody.appendChild(title);

    const characterInfo: HTMLDivElement = document.createElement("div");
    const characterImage: HTMLImageElement = document.createElement("img");
    characterImage.src = `assets/${character.Image.ImagePath}`;
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

    //Add Timer till next character
    const cardFooter: HTMLDivElement = document.createElement("div");
    cardFooter.classList.add(
      "card-footer",
      "d-flex",
      "flex-column",
      "justify-content-center",
      "align-items-center",
      "gap-4"
    );

    const lastUpdate: Date = new Date(
      await (await fetch(`${apiHost}/api/time/getlastcharacterupdate`)).json()
    );
    //Add 24 hours to the last update
    lastUpdate.setHours(lastUpdate.getHours() + 24);
    console.log(lastUpdate);

    const currentDate: Date = new Date();

    // Calculate the difference in milliseconds
    const timeDifferenceMilliseconds = lastUpdate.getTime() - currentDate.getTime();


    // Calculate the difference in hours
    const hoursLeft : number = Math.floor(timeDifferenceMilliseconds /1000 / 60 / 60);

    // Calculate the difference in minutes
    const minutesLeft :number = Math.floor(timeDifferenceMilliseconds /1000 / 60 - hoursLeft * 60);


    //Construct the timer
    const timer: HTMLDivElement = document.createElement("div");
    timer.classList.add("d-flex", "flex-column", "align-items-center", "gap-2");

    const timerTitle: HTMLHeadingElement = document.createElement("h3");
    timerTitle.classList.add("card-title");
    timerTitle.textContent = "Next character in:";
    timer.appendChild(timerTitle);

    const timerBody: HTMLDivElement = document.createElement("div");
    timerBody.classList.add("d-flex", "flex-row", "align-items-center", "gap-2");

    const hours: HTMLSpanElement = document.createElement("span");
    hours.classList.add("fw-bold", "fs-1");
    hours.textContent = hoursLeft.toString();
    timerBody.appendChild(hours);

    const hoursText: HTMLSpanElement = document.createElement("span");
    hoursText.classList.add("fw-bold", "fs-1");
    hoursText.textContent = "hours";
    timerBody.appendChild(hoursText);

    const minutes: HTMLSpanElement = document.createElement("span");
    minutes.classList.add("fw-bold", "fs-1");
    minutes.textContent = minutesLeft.toString();
    timerBody.appendChild(minutes);

    const minutesText: HTMLSpanElement = document.createElement("span");
    minutesText.classList.add("fw-bold", "fs-1");
    minutesText.textContent = "minutes";
    timerBody.appendChild(minutesText);

    timer.appendChild(timerBody);

    cardFooter.appendChild(timer);




    dialogElement.appendChild(cardBody);
    dialogElement.appendChild(cardFooter);



    return dialogElement;
  }

  async function GetDailyCharacterString(): Promise<string | null> {
    try {
      return await (
        await fetch(`${apiHost}/api/Characters/GetDailyCharacter`)
      ).json();
    } catch (error) {
      return null;
    }
  }
  async function GetAllCharacters(): Promise<Array<CharacterTypes.Character> | null> {
    try {
      return JSON.parse(
        await (await fetch(`${apiHost}/api/Characters/GetAllCharacters`)).json()
      );
    } catch (error) {
      return null;
    }
  }

  //Add the guess
  onsubmit = async (e) => {
    e.preventDefault();

    //Prevent submitting if the input is empty
    if (inputElement.value.length < 1) return;

    const characters = GetSuggestions(inputElement.value);

    //Prevent submitting if there are no suggestions
    if (characters.length < 1) return;

    await AddGuess(characters[0]);
  };

  //Event listeners

  //Show suggestions on input focus
  inputElement.addEventListener("focus", () => {
    suggestions.classList.toggle("disappear");
    suggestions.classList.toggle("d-flex");
  });

  //Hide suggestions on input blur
  inputElement.addEventListener("blur", async () => {
    suggestions.classList.toggle("disappear");
    await setTimeout(() => {
      suggestions.classList.toggle("d-flex");
    }, 500);
  });

  inputElement.addEventListener("input", (e) => {
    if (inputElement.value.length < 1) {
      suggestions.innerHTML = "";
      return;
    }
    const characters = GetSuggestions(inputElement.value);

    suggestions.innerHTML = "";

    //Change so the suggestions are not flickering
    characters.forEach((element) => {
      const suggestion = GreateSuggestionDiv(element);

      suggestion.addEventListener("click", async () => {
        await AddGuess(element);
      });

      suggestions.insertAdjacentElement("beforeend", suggestion);
    });
  });

  function FetchError(error: string): void {
    const dialogElement: HTMLDialogElement = document.createElement("dialog");
    dialogElement.classList.add("card", "text-center", "error-modal");

    const cardBody: HTMLDivElement = document.createElement("div");
    cardBody.classList.add(
      "card-body",
      "d-flex",
      "flex-column",
      "align-items-center",
      "gap-4"
    );

    const title: HTMLHeadingElement = document.createElement("h2");
    title.classList.add("card-title");
    title.textContent = "Oops! Something went wrong.";
    cardBody.appendChild(title);

    const description: HTMLParagraphElement = document.createElement("p");
    description.classList.add("card-text");
    description.textContent = error + " Please try again later.";

    cardBody.appendChild(description);

    const button: HTMLButtonElement = document.createElement("button");
    button.classList.add("btn", "btn-primary");
    button.textContent = "Close";
    button.addEventListener("click", () => {
      dialogElement.close();
      dialogElement.remove();
    });

    cardBody.appendChild(button);
    dialogElement.appendChild(cardBody);

    document.body.appendChild(dialogElement);
    dialogElement.showModal();
  }
});
