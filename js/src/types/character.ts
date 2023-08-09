export namespace CharacterTypes {

    export class Character
    {
        CharacterName: string;
        Gender :string;
        Origin :string;
        Height :Height;
        ReleaseYear :number;
        Difficulty :Difficulty;
        Image :Image;

        constructor(CharacterName: string, Gender :string,Origin :string,Height :Height,ReleaseYear :number,Difficulty :Difficulty,Image :Image) {
            this.CharacterName = CharacterName;
            this.Gender = Gender;
            this.Origin = Origin;
            this.Height = Height;
            this.ReleaseYear = ReleaseYear;
            this.Difficulty = Difficulty;
            this.Image = Image;

        }
    }
    

    export enum Height{
        Tall,
        Average,
        Short
    }

    export enum Difficulty{
        Hard,
        Very_Hard,
        Moderate,
        Easy
    }

    class Image
    {
        ImagePath: string;
        constructor(ImagePath: string) {
            this.ImagePath = ImagePath;
        }
    }



}