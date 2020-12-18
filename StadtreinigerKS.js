// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: red; icon-glyph: recycle;
//

//////////////////////////////////////////////////////////////////////////////////////////////
// Description of this widget
// ⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺
// Shows next dates, at which garbage is collected bei "Stadtreiniger"
// 
//
// Installation/Configuration
// ⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺
// You have to give LocationID as parameter
// To get location ID for your home, follow these steps:
// 1. open https://insert-it.de/BMSAbfallkalenderKassel/ 
// 2. enter your street and number
// 3. calender will appear
// 4. check url-parameter. You need the number after ...bmsLocationId=
//    e.g. for Kirchweg 17 it's 104242
// 5. This number must be given as parameter to the widget
// 
// ToDo / Ideas
// ⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺
// (1) .
// 
//////////////////////////////////////////////////////////////////////////////////////////////

//const muellURL      = "https://insert-it.de/BMSAbfallkalenderKassel/Main/LoadCalenderView?bmsLocationId=104242&year=2021"
const muellURL      = "https://insert-it.de/BMSAbfallkalenderKassel/Main/LoadCalenderView?bmsLocationId=[LocationID]&year=[yyyy]"
const imgURL        = "https://insert-it.de/BMSAbfallkalenderKassel/img/"
const faviconURL    = "https://www.stadtreiniger.de/fileadmin/img/favicon.ico"  // only works for light white background
//const faviconURL    = ""
const faviconDarkURL= "" // favicon_dark.png
const widgetURL     = "https://www.stadtreiniger.de"
  let headerString  = "Stadtreiniger" 
const headerSubstring  = ""  // e.g. "Hauptstr. 42"; not displayed at all, if string is ""
  let locationID    = ""
const borderWidth   = 0
const maxErrLength  = 90
  let errorStr      = ""
const dfDayFormat   = "EEE d.MM.yyyy"
const forceDownload = false
const appArgs       = "104242" // used in app environment, to have widget configuration 

//
const S_STACK_WIDTH = 150
const LOGO_SIZE     = 35
const FAVICON_SIZE  = 16
const WRONG_YEAR    = 1973

//////////////////////////////////////////////////////////////////////////////////////////////
// DEBUG-CONFIG - DON'T TOUCH THIS
//////////////////////////////////////////////////////////////////////////////////////////////
//
const DEBUG = false
  let debugRow
  let debugText
//
//////////////////////////////////////////////////////////////////////////////////////////////

// my muell
// ["label", "ID", "Icon"],
let myMuell = [
   ["Restmüll", "console.log(6)", "abfuhrtonne_grau.png", "17.12.2020"],
   ["Biotonne", "console.log(3)", "abfuhrtonne_braun.png", "17.12.2020"],
   ["gelber Sack", "console.log(4)", "abfuhrtonne_gelb.png", "17.12.2020"]    // last entry without comma
];


let widget = await createWidget()
if (!config.runsInWidget) await widget.presentSmall()
Script.setWidget(widget)
Script.complete()

async function createWidget(items) {
const dfDate = dfCreateAndInit(dfDayFormat)
const localFavicon = "stadtreiniger_favicon.ico"
const localFaviconDark = "stadtreiniger_favicon_dark.png"
  let stackWidth = S_STACK_WIDTH
  let tempStr
  let today = new Date()
  let thisYear = today.getFullYear()
  let dataThisYear  = ""
  let dataNextYear  = ""
  let date
  let i = 0
  let msgLine



  const list = new ListWidget()
  list.refreshAfterDate = new Date(Date.now() + (1800 * 1000)) // refresh after 30 min
  list.setPadding(0,0,0,0)
  list.addSpacer(2)
  list.url = widgetURL

  // DEBUG init
  if (DEBUG) {
    debugRow = list.addStack()
    debugText = debugRow.addText("DEBUG")
    debugText.font = Font.mediumSystemFont(6)
  }
  // DEBUG_END

  let parCount = parseInput(args.widgetParameter)
  
  if (parCount != 1) {
    msgLine = list.addText("⚠︎ Missing bmsLocationId")
    msgLine.font = Font.mediumSystemFont(11)
    msgLine = list.addText("     as widget-parameter")
    msgLine.font = Font.mediumSystemFont(11)
    msgLine = list.addText("     Check this URL, to")
    msgLine.font = Font.mediumSystemFont(11)
    msgLine = list.addText("     get ID for your home.")
    msgLine.font = Font.mediumSystemFont(11)
    msgLine = list.addText("https://insert-it.de/BMSAbfallkalenderKassel")
    msgLine.font = Font.mediumSystemFont(11)
    msgLine.textColor = Color.blue()
    msgLine = list.addText("     After entering your")
    msgLine.font = Font.mediumSystemFont(11)
    msgLine = list.addText("     address. ID is inserted")
    msgLine.font = Font.mediumSystemFont(11)
    msgLine = list.addText("     as URL-parameter.")
    msgLine.font = Font.mediumSystemFont(11)
    list.url = "https://insert-it.de/BMSAbfallkalenderKassel"
    return list
  }

  // fetches all the data from webpage
  dataNextYear = await fetchData(locationID, thisYear+1);  
  dataThisYear = await fetchData(locationID, thisYear);  
  
  // fill array with correct dates
  for (i=0; i<myMuell.length; i++) {
    date = getDate4MuellComplete(dataThisYear, dataNextYear, myMuell[i][1])
    myMuell[i][3] = date.toString()
  }

  if (dataThisYear.length <= maxErrLength) {
    list.addText("⚠︎ Stadtreiniger")
    list.addText("     nicht")
    list.addText("     erreichbar!")
    list.addText(dataThisYear)  // it's an error message 
    return list
  }
  
  // ##Headline
  let headerStack = addStackWithOptions(list, stackWidth, 0, borderWidth, Color.red(), false)
//   printSFSymbol(headerStack, "arrow.3.trianglepath", 16)  
  let headerLine = headerStack.addText(headerString)
  headerLine.font = Font.boldSystemFont(16)
  headerLine.textColor = Color.orange()
  if ( headerSubstring.length > 0) {
    headerStack = addStackWithOptions(list, stackWidth, 0, borderWidth, Color.red(), false)
    let headerSubLine = headerStack.addText(headerSubstring)
    headerSubLine.font = Font.boldSystemFont(8)
    headerSubLine.textColor = Color.gray()
  }
  
  // add icon in the upper right corner
  if (Device.isUsingDarkAppearance()) {
    if (faviconDarkURL.length > 0) { 
      addFavicon(headerStack, faviconDarkURL, localFaviconDark)  // dark icon (not available now)
      headerLine.text += " " // add space between headertext and icon
    }    
  } else {
    if (faviconURL.length > 0) { 
      addFavicon(headerStack, faviconURL, localFavicon) // standard icon with white background
      headerLine.text += " "  // add space between headertext and icon
    } 
  }

  list.addSpacer(6)
   
  // ##three lines for each type of garbage (Restmüll, Biotonne, Gelber Sack/Tonne)
  let listStack = addStackWithOptions(list, stackWidth, 0, borderWidth, Color.green(), false)
    
  // icon column
  let iconColStack = listStack.addStack()
  let iconColLineLeft
  let iconColRowStack
  iconColStack.layoutVertically()
  for (i=0; i<myMuell.length; i++) {
    iconColRowStack = addStackWithOptions(iconColStack, 45, LOGO_SIZE + 2, borderWidth, Color.yellow(), false)
    addLogo(iconColRowStack, myMuell[i][2])
    iconColStack.addSpacer(3) 
  }
  
  // label + date column
  //let dateColStack = addStackWithOptions(listStack, 100, 0, borderWidth, Color.yellow(), false)
  let dateColStack = listStack.addStack()
  let dateColLineRight
  let dateColRowStack
  dateColStack.layoutVertically()
  for (i=0; i<myMuell.length; i++) {
      dateColRowStack = addStackWithOptions(dateColStack, 100, iconColRowStack.size.height, borderWidth, Color.orange(), true)
      dateColLineRight = dateColRowStack.addText("" + myMuell[i][0]  )
      dateColLineRight.font = Font.regularSystemFont(13)  
      dateColLineRight = dateColRowStack.addText("" + dfDate.string( new Date(myMuell[i][3]) ) )
      dateColLineRight.font = Font.boldSystemFont(13)  
      if ( dateDiffInDays(today, new Date(myMuell[i][3]) ) == 1 || dateDiffInDays(today, new Date(myMuell[i][3]) ) == 0) { dateColLineRight.textColor = Color.red() }
      if ( dateDiffInDays(today, new Date(myMuell[i][3]) ) == 2) { dateColLineRight.textColor = Color.orange() } 
      dateColStack.addSpacer(3) 
  }
  
  return list
}

function addStackWithOptions(stack, width, height, border, color, vertically) {
  let newStack = stack.addStack()
  if (vertically) { newStack.layoutVertically() } else { newStack.layoutHorizontally() }
  newStack.size = new Size(width, height)
  newStack.borderWidth = border
  newStack.borderColor = color
  newStack.setPadding(0,0,0,0)
  return newStack
}


function printSFSymbol(stack, symbolStr, width) {
  let mobileIcon
  let mobileIconElement
  mobileIcon = SFSymbol.named(symbolStr);
  mobileIconElement = stack.addImage(mobileIcon.image)
  mobileIconElement.imageSize = new Size(width, width)
  mobileIconElement.tintColor =  Color.orange()
}

function getDate4MuellComplete(thisYear, nextYear, ID) {
  let date
  const dfDate = dfCreateAndInit(dfDayFormat)
  
  date = getDate4Muell(thisYear, ID)
  if (date.getFullYear() == WRONG_YEAR) {
      date = getDate4Muell(nextYear, ID)
  }
  return date
}

function getDate4Muell(page, ID) {
  let webpagePart = page
  let date = new Date(WRONG_YEAR, 4, 2)
  let year = WRONG_YEAR
  let month = -1
  let day = -1
  let posID = -1

  // get the year
  posID = webpagePart.indexOf("year=")
  if (posID > 0) {
    webpagePart = webpagePart.substring(posID)
    year = get1stNumber(webpagePart)
  } else {
    return date
  }
  
  // get the month
  posID = webpagePart.indexOf(ID)
  if (posID > 0) {
    // get the month
    webpagePart = webpagePart.substring(0, posID)
    posID = webpagePart.lastIndexOf("bg-danger")
    if (posID > 0) {
      webpagePart = webpagePart.substring(posID)
      month = searchMonth(webpagePart)
    }
  }
    
  // get the day
  posID = webpagePart.lastIndexOf("tableDay")
  if (posID > 0) {
    webpagePart = webpagePart.substring(posID)
    day = get1stNumber(webpagePart)
  }
  
  if (year > WRONG_YEAR && month >= 0 && day > 0) {
    date.setFullYear(year)
    date.setMonth(month)
    date.setDate(day)
  }
  
  return date
}

function get1stNumber (string) {
  var regex = /(\d+)/g;
  var result = (string.match(regex));
  return result[0];  // 1st of all numbers
}

function searchMonth (string) {
  const month = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember" ];
 
  for (i=0; i<month.length; i++) {
    if ( string.indexOf(month[i]) > 0 ){
      return i
    }
  }
  return -1
}


function dateDiffInDays (d1, d2) {
  const date1 = new Date(d1)
  const date2 = new Date(d2)
  const diffTime = Math.abs(date2 - date1);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  return diffDays 
}

async function fetchData(loc, year) {
  let apiURL = muellURL
  let errorStr = ""
  
  apiURL = apiURL.replace("[LocationID]", loc)
  apiURL = apiURL.replace("[yyyy]", year)
  
  let api_online = false
  let return_data
    
  try {
    const req = new Request(apiURL);
    return_data = await req.loadString();
    api_online = true
  } catch (err) {
    errorStr = err.toString() 
    api_online = false
  }
  
  if (api_online) {
    return return_data
  } else {
    return errorStr.substring(0, maxErrLength-1)  // shortened, so calling function can decide, if it is an errorMsg or the full webpage
  }
}

async function addLogo(stack, logo) {
  const imageUrl = imgURL + logo 
  let fm = FileManager.local()
  let dir = fm.documentsDirectory()
  let path = fm.joinPath(dir, logo)
  let logoImage
  let stackImage
  
  if (fm.fileExists(path) && !forceDownload) { 
    logoImage = fm.readImage(path)
  } else {
    // download once
    logoImage = await loadWebImage(imageUrl);
    fm.writeImage(path, logoImage)
  }

  stackImage = stack.addImage(logoImage)
  stackImage.imageSize = new Size(LOGO_SIZE, LOGO_SIZE)
}

async function addFavicon(stack, iconURL, localIcon) {
  let fm = FileManager.local()
  let dir = fm.documentsDirectory()
  let path = fm.joinPath(dir, localIcon)
  let iconImage
  let stackImage
    
  if (fm.fileExists(path) && !forceDownload) { 
    iconImage = fm.readImage(path);
  } else {
    // download once
    try{
      iconImage = loadWebImage(iconURL);
      fm.writeImage(path, iconImage);
    } catch (err) {
    }
  }

  stackImage = stack.addImage(iconImage)
  stackImage.rightAlignImage()
  stackImage.imageSize = new Size(FAVICON_SIZE, FAVICON_SIZE)
}


// creates and inits a DateFormatter
function dfCreateAndInit (format) {
  const df = new DateFormatter()
  df.dateFormat = format
  return df
}

async function loadWebImage(imgUrl) {
    const req = new Request(imgUrl)
              
    try {
      let returnImage = req.loadImage();
    } catch (err) {
    }
    return returnImage
}

// parses the widget parameters
function parseInput(input) {
  let wParameter = []

  if (!config.runsInWidget) {
    input = appArgs
  }

  input = input.replace(/;/g,",")  // convert ; -> ,

  if (input != null && input.length > 0) {
    wParameter = input.split(",")
    let parCount = wParameter.length
    
    for (i=0; i < parCount; i++) {
      locationID = wParameter[i].trim()
    } 
    
    return wParameter.length
  } 
  return 0
}

function minmax(num, min, max){
  return Math.min(Math.max(num, min), max)
}

//EOF
