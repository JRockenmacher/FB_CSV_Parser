//basic requirements for a express server
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const fs = require('fs');
const lineReader = require('line-reader');

// need to make an app variable to use
const app = express();

// tell our app what to use

app.use(morgan('dev'));

app.use(cors());

// global vars for writing to file later 

let coordinateArray = [];

var megaObj = {};

app.get('/getit', (request, response) => {


  lineReader.eachLine('./FacebookPlaces_Albuquerque.csv', function(line, last) {

      let lineAry = [];
      ////////// filter original lines, push them to new array
      for (let i = line.length -1; i >= line.length -3; i--) {
        if (line[line.length-1] === ',' && line[line.length-2] === ',') {
          let formattedLine = line.substring(0, line.length - 3);
          lineAry.push(formattedLine);
        } else if (line[line.length-1] === ',' && !isNaN(line[line.length-2])) {
          let formattedLine = line.substring(0, line.length - 1);
          lineAry.push(formattedLine)
        } else {
          let formattedLine = line.substring(0, line.length);
          lineAry.push(formattedLine);
        }
      }
      ///////// take array of filtered lines, loop through them, find the
      ////////  index we care about (where the 2nd comma is), store that index
      ////////  use that index to split the string into parts you care about
      ////////  put those string parts into the megaObj
      let indy;
      let commaCount = 0;
      for (let i = lineAry.length-1; i > 0; i--) {
        for (let j = lineAry[i].length -1; j >= 0; j--) {
          if (commaCount < 2) {
            if (lineAry[i][j] === ',') {
              commaCount++;
              indy = j;
            }
          }
        }
        let bizName = lineAry[i].substring(0, indy);
        let bizCoords = lineAry[i].substring(indy+1, lineAry[i].length);
        megaObj[bizName] = bizCoords;
      }
      //////////// log all the data

  /////// write new file based on the filtered data
})
fs.writeFile('formattedData.json', JSON.stringify(megaObj, null, 4), function(err) {
  console.log('File successfully written! - Check your project directory for the formattedData.json file!');
})
})

let megaObj2 = require("./formattedData.json");

app.get("/buildit", (request, response) => {

    const places = Object.entries(megaObj2).map(([place, coord]) => ({ place, coord }))

    const splitCoords = (megaObj2) => {
        return megaObj2[Object.keys(megaObj2)[1]].split(",")
    }

    // get type of business for a variety of scenarios. Since the spirit of the app is durring a zombie apocalypse, we have a focus on sustenance and important services, landmarks, etc. to help navigate this new, perilous landscape
    function getCategory(desc) {
        desc = desc.toLowerCase()
        if (
            desc.includes("health") ||
            desc.includes("pharmacy") ||
            desc.includes("medical")
        )
            return "Health/Medical/Pharmacy"
        if (desc.includes("church") || desc.includes("religious organization"))
            return "Church/religious organization"
        if (desc.includes("restaurant") || desc.includes("cafe"))
            return "Restaurant/cafe"
        if (desc.includes("home improvement")) return "Home improvement"
        if (
            desc.includes("sports") ||
            desc.includes("recreation") ||
            desc.includes("activities")
        )
            return "Sports/recreation/activities"
        if (desc.includes("government organization"))
            return "Government organization"
        if (desc.includes("school")) return "School"
        if (
            desc.includes("hospital") ||
            desc.includes("clinic") ||
            desc.includes("urgent care")
        )
            return "Hospital/clinic"
        if (desc.includes("landmark")) return "Landmark"
        if (desc.includes("market")) return "Market"
        if (desc.includes("bar")) return "Bar"
        if (desc.includes("public places")) return "Public places"
        if (desc.includes("hotel")) return "Hotel"
        if (desc.includes("community") || desc.includes("government"))
            return "Community/government"
        if (desc.includes("radio station")) return "Radio station"
        return "Local Business *"
    }

    // now to construct a final object of data that is digestable with bizName, bizType, and the coords as accessible numbers.
    objConstruct = (obj) => {
        let g = 0
        console.log(g++)
        return {
            bizName: obj.place,
            bizType: getCategory(obj.place),
            lat: Number(splitCoords(obj)[0]),
            long: Number(splitCoords(obj)[1]),
        }
    }

    const builtJSON = places.map(objConstruct)

    fs.writeFile(
        "BuiltFunction.json",
        JSON.stringify(builtJSON, null, 4),
        function (err) {
            console.log(
                "File successfully written! - Check your project directory for the formattedData.json file!"
            )
        }
    )

})
// })
// app.get('/transform-it', (req, res) => {})

const port = process.env.PORT || 8003
app.listen(port, () => {
    console.log("Listening on port ", port)
})
