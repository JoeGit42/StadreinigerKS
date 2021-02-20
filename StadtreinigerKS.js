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

const muellURL      = "https://insert-it.de/BMSAbfallkalenderKassel/Main/LoadCalenderView?bmsLocationId=[LocationID]&year=[yyyy]"
//const faviconURL    = "https://www.stadtreiniger.de/fileadmin/img/favicon.ico"  // only works for light white background
const faviconURL    = ""
const faviconDarkURL= "" // favicon_dark.png
//const widgetURL     = "https://www.stadtreiniger.de"
  let widgetURL     = "https://insert-it.de/BMSAbfallkalenderKassel?bmsStreetId=[StreetID]&bmsLocationId=[LocationID]&year=[yyyy]"
  let headerString  = "Stadtreiniger" 
const headerSubstring  = ""  // e.g. "Hauptstr. 42"; not displayed at all, if string is ""
  let locationID    = ""
  let streetID      = ""
const borderWidth   = 0
const maxErrLength  = 90
  let errorStr      = ""
const dfDayFormat   = "EEE dd.MM.yyyy"
const forceDownload = false
const sortByDate    = true
const showNotCollectedGarbage = false
const appArgs       = "100110" // used in app environment, to have widget configuration (2 types: 100110, 3 types: 104242, 4 types: 105242)
const recYear       = "year="
const recMonth      = "bg-danger"
const recDay        = "tableDay"

//
const S_STACK_WIDTH = 150
const WRONG_YEAR    = 1973

// Refresh
const REFRESH_TIME = "00:00"  // widget will be refreshed this time next day. (or not earlier than that)
const REFRESH_OFFSET_MIN = 30 // seconds
const REFRESH_OFFSET_MAX = 180// seconds

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

let myMuell = [
   { title: 'Biotonne',    rec: 'console.log(3)', iconPath: 'http://webapp.abfall-kreis-kassel.de/fileadmin/webapp/images/',      iconName: 'icon-fraktion-bioabfall.png',        date: new Date (1942, 4, 2) },   
   { title: 'Restmüll',    rec: 'console.log(6)', iconPath: 'http://webapp.abfall-kreis-kassel.de/fileadmin/user_upload/',        iconName: 'icon-fraktion-restabfall.png',       date: new Date (1942, 4, 2) },
   { title: 'Gelbe Tonne', rec: 'console.log(4)', iconPath: 'https://raw.githubusercontent.com/JoeGit42/StadtreinigerKS/main/',   iconName: 'icon-fraktion-gelbetonne_temp.png',  date: new Date (1942, 4, 2) },    
   { title: 'Altpapier',   rec: 'console.log(1)', iconPath: 'http://webapp.abfall-kreis-kassel.de/fileadmin/webapp/images/',      iconName: 'icon-fraktion-papier.png',           date: new Date (1942, 4, 2) }    // last entry without comma
];
// my muell (old iconset)
/*
let myMuell = [ 
   { title: 'Biotonne',    rec: 'console.log(3)', iconPath: 'http://insert-it.de/BMSAbfallkalenderKassel/img/', iconName: 'abfuhrtonne_braun.png', date: new Date (1942, 4, 2) },   
   { title: 'Restmüll',    rec: 'console.log(6)', iconPath: 'http://insert-it.de/BMSAbfallkalenderKassel/img/', iconName: 'abfuhrtonne_grau.png',  date: new Date (1942, 4, 2) },
   { title: 'Gelber Sack', rec: 'console.log(4)', iconPath: 'http://insert-it.de/BMSAbfallkalenderKassel/img/', iconName: 'abfuhrtonne_gelb.png',  date: new Date (1942, 4, 2) },    
   { title: 'Altpapier',   rec: 'console.log(1)', iconPath: 'http://insert-it.de/BMSAbfallkalenderKassel/img/', iconName: 'abfuhrtonne_blau.png',  date: new Date (1942, 4, 2) }    // last entry without comma
];
*/

// layout
let layout = [
  {cnt: 1, spaceAfterHeader:26, spaceAfterEntry:24, logoSize:35, fontSizeEntry:13, fontSizeHeader:18},
  {cnt: 2, spaceAfterHeader:16, spaceAfterEntry:14, logoSize:35, fontSizeEntry:13, fontSizeHeader:18},
  {cnt: 3, spaceAfterHeader: 6, spaceAfterEntry: 4, logoSize:35, fontSizeEntry:13, fontSizeHeader:16},
  {cnt: 4, spaceAfterHeader: 1, spaceAfterEntry: 2, logoSize:30, fontSizeEntry:12, fontSizeHeader:14}
];
let layoutIndex = -1

sortMuell = function(elm1, elm2) {
  // special handling for unknown dates - means this kind of garbage is not supported in this area
  // so it can be displayed at the end
  if (elm1.date.getFullYear() == WRONG_YEAR) {
    return 1;
  } else if (elm2.date.getFullYear() == WRONG_YEAR) {
    return -1;
  } else if (elm1.date > elm2.date){
    return 1
  } else if (elm1.date < elm2.date) {
    return -1
  } else return 0;
}

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
    let i = 0
    let msgLine

  const list = new ListWidget()
  list.setPadding(0,0,0,0)
  list.addSpacer(2)
  
  // DEBUG init
  if (DEBUG) {
    debugRow = list.addStack()
    debugText = debugRow.addText("DEBUG")
    debugText.font = Font.mediumSystemFont(6)
  }
  // DEBUG_END

  let parCount = parseInput(args.widgetParameter)

  // Set widget URL
  widgetURL = widgetURL.replace("[LocationID]", locationID)
  widgetURL = widgetURL.replace("[StreetID]", streetID)
  widgetURL = widgetURL.replace("[yyyy]", (today.getMonth()==11) ? thisYear+1 : thisYear)
  list.url = widgetURL
  
  if (parCount < 1) {
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
    myMuell[i].date = getDate4MuellComplete(dataThisYear, dataNextYear, myMuell[i].rec)
    // 2nd level sort (used by equal dates) is done in the order, which is defined by original array structure
    // to enable this, the hour of date is manipulated
    myMuell[i].date.setHours(i)
  }
  
  // data not fetched from web
  if (dataThisYear.length <= maxErrLength) {
    list.addText("⚠︎ Stadtreiniger")
    list.addText("     nicht")
    list.addText("     erreichbar!")
    list.addText(dataThisYear)  // it's an error message 
    return list
  }
  
  // delete entries, which are not supported in this area
  if ( !showNotCollectedGarbage ) {
    for (i = myMuell.length - 1; i>=0; i--) {
      if ( myMuell[i].date.getFullYear() == WRONG_YEAR ) { myMuell.splice(i, 1) }
    }
  }
  
  layoutIndex = minmax(myMuell.length -1, 0, layout.length)
  
  // sort array by date
  if ( sortByDate ) {
    myMuell = myMuell.sort(sortMuell)
  }
  
  // ##Headline
  let headerStack = addStackWithOptions(list, stackWidth, 0, borderWidth, Color.red(), false)
//   printSFSymbol(headerStack, "arrow.3.trianglepath", layout[layoutIndex].fontSizeHeader)  
  let headerLine = headerStack.addText(headerString)
  headerLine.font = Font.boldSystemFont(layout[layoutIndex].fontSizeHeader)
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
      await addFavicon(headerStack, faviconDarkURL, localFaviconDark);  // dark icon (not available now)
      headerLine.text += " " // add space between headertext and icon
    }    
  } else {
    if (faviconURL.length > 0) { 
      await addFavicon(headerStack, faviconURL, localFavicon); // standard icon with white background
      headerLine.text += " "  // add space between headertext and icon
    } 
  }

  list.addSpacer(layout[layoutIndex].spaceAfterHeader)
   
  // ##three lines for each type of garbage (Restmüll, Biotonne, Gelber Sack/Tonne)
  let listStack = addStackWithOptions(list, stackWidth, 0, borderWidth, Color.green(), false)
    
  // icon column
  let iconColStack = listStack.addStack()
  let iconColLineLeft
  let iconColRowStack
  iconColStack.layoutVertically()
  for (i=0; i<myMuell.length; i++) {
    iconColRowStack = addStackWithOptions(iconColStack, 50, layout[layoutIndex].logoSize, borderWidth, Color.yellow(), false)
    iconColRowStack.addSpacer(9)
    await addLogo(iconColRowStack, myMuell[i].iconPath, myMuell[i].iconName)
    iconColRowStack.addSpacer()
    iconColStack.addSpacer(layout[layoutIndex].spaceAfterEntry) 
  }
  
  // text + date column
  //let dateColStack = addStackWithOptions(listStack, 100, 0, borderWidth, Color.yellow(), false)
  let dateColStack = listStack.addStack()
  let dateColLineRight
  let dateColRowStack
  dateColStack.layoutVertically()
  for (i=0; i<myMuell.length; i++) {
      dateColRowStack = addStackWithOptions(dateColStack, 105, iconColRowStack.size.height, borderWidth, Color.orange(), true)
      dateColLineRight = dateColRowStack.addText("" + myMuell[i].title  )
      dateColLineRight.font = Font.regularSystemFont(layout[layoutIndex].fontSizeEntry)
      if ( myMuell[i].date.getFullYear() != WRONG_YEAR ) { 
        dateColLineRight = dateColRowStack.addText("" + dfDate.string( myMuell[i].date ) )
      } else {
        dateColLineRight = dateColRowStack.addText("--")
      }      
      if ( dateColLineRight.text.indexOf(".") == 2 ) { dateColLineRight.text = dateColLineRight.text.replace(".", ",") }  // replace point after short weekday with comma
      dateColLineRight.font = Font.boldSystemFont(layout[layoutIndex].fontSizeEntry)  
      if ( dateDiffInDays(today, myMuell[i].date ) <= 1) { dateColLineRight.textColor = Color.red() }
      if ( dateDiffInDays(today, myMuell[i].date ) == 2) { dateColLineRight.textColor = Color.orange() } 
      dateColStack.addSpacer(layout[layoutIndex].spaceAfterEntry) 
  }
  
  // refresh next day early in the morning
  list.refreshAfterDate = getRefreshDate(REFRESH_TIME, REFRESH_OFFSET_MIN, REFRESH_OFFSET_MAX)

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
  let date = new Date(WRONG_YEAR, 1, 4)
  let year = WRONG_YEAR
  let month = -1
  let day = -1
  let posID = -1

  // get the year
  posID = webpagePart.indexOf(recYear)
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
    posID = webpagePart.lastIndexOf(recMonth)
    if (posID > 0) {
      webpagePart = webpagePart.substring(posID)
      month = searchMonth(webpagePart)
    }
  }
    
  // get the day
  posID = webpagePart.lastIndexOf(recDay)
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
  const month = ["Januar", "Februar", "März", "M&#xE4;rz", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember" ];
 
  for (i=0; i<month.length; i++) {
    if ( string.indexOf(month[i]) > 0 ){
      if (i<3) {
        return i
      } else { 
        return i-1
      }
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

function getRefreshDate (rTimeStr, minOffsetSec, maxOffsetSec) {
  // set tomorrow
  const d = new Date()
  let rDate = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)
  
  // in the early morning
  let rtime = rTimeStr.split(":")
  rDate.setHours(rtime[0])
  rDate.setMinutes(rtime[1])
  rDate.setSeconds(getRandomArbitrary(minOffsetSec, maxOffsetSec))
  
  return rDate
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

async function addLogo(stack, logoPath, logoName) {
  let imageUrl = logoPath + logoName 
  let fm = FileManager.local()
  let dir = fm.documentsDirectory()
  let path = fm.joinPath(dir, logoName)
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
  stackImage.leftAlignImage()
  stackImage.imageSize = new Size(layout[layoutIndex].logoSize, layout[layoutIndex].logoSize)
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
      iconImage = await loadWebImage(iconURL);
      fm.writeImage(path, iconImage);
    } catch (err) {
    }
  }

  stackImage = stack.addImage(iconImage)
  stackImage.rightAlignImage()
  stackImage.imageSize = new Size(layout[layoutIndex].fontSizeHeader, layout[layoutIndex].fontSizeHeader)
}


// creates and inits a DateFormatter
function dfCreateAndInit (format) {
  const df = new DateFormatter()
  df.dateFormat = format
  return df
}

async function loadWebImage(imgUrl) {
  let req = new Request(imgUrl)
  return await req.loadImage()
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
    
    if (parCount > 0) { locationID = wParameter[0].trim() }
    if (parCount > 1) { 
      streetID = wParameter[1].trim() 
      if ( parseInt(locationID) < parseInt(streetID)) {
        // Oh, streetID was given as 1st parameter -> change order
        streetID   = wParameter[0].trim()
        locationID = wParameter[1].trim()
      }
    }
    

    
    return wParameter.length
  } 
  return 0
}

function minmax(num, min, max){
  return Math.min(Math.max(num, min), max)
}

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}


//EOF
