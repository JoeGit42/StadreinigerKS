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
//const faviconURL    = "https://www.stadtreiniger.de/fileadmin/img/favicon.ico"  // only works for light white background
const faviconURL    = ""
const faviconDarkURL= "" // favicon_dark.png
const widgetURL     = "https://www.stadtreiniger.de"
  let headerString  = "Stadtreiniger" 
const headerSubstring  = ""  // e.g. "Hauptstr. 42"; not displayed at all, if string is ""
  let locationID    = ""
const borderWidth   = 0
const maxErrLength  = 90
  let errorStr      = ""
const dfDayFormat   = "EEE dd.MM.yyyy"
const forceDownload = false
const sortByDate    = true
const showNotCollectedGarbage = false
const appArgs       = "104242" // used in app environment, to have widget configuration 

//
const S_STACK_WIDTH = 150
const LOGO_SIZE     = 35
const FAVICON_SIZE  = 16
const WRONG_YEAR    = 1973
const REFRESH       = (2* 60 * 60 * 1000)  // 4 hours

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
// ["text", "ID", "Icon"],
let myMuell = [
   { title: 'Biotonne',    rec: 'console.log(3)', icon: 'abfuhrtonne_braun.png', date: new Date (1942, 4, 2) },   
   { title: 'Restmüll',    rec: 'console.log(6)', icon: 'abfuhrtonne_grau.png',  date: new Date (1942, 4, 2) } ,
   { title: 'Gelber Sack', rec: 'console.log(4)', icon: 'abfuhrtonne_gelb.png',  date: new Date (1942, 4, 2) }    // last entry without comma
];

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
    let addSpacer = 0

  const list = new ListWidget()
  list.refreshAfterDate = new Date(Date.now() + (REFRESH)) 
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
    for (i=0; i<myMuell.length; i++) {
      if ( myMuell[i].date.getFullYear() == WRONG_YEAR ) { myMuell.splice(i, 1) }
    }
    // some more space in layout, if less than 3 entries
    addSpacer = (3 - myMuell.length) * 10
  }
  
  // sort array by date
  if ( sortByDate ) {
    myMuell = myMuell.sort(sortMuell)
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

  list.addSpacer(6+addSpacer)
   
  // ##three lines for each type of garbage (Restmüll, Biotonne, Gelber Sack/Tonne)
  let listStack = addStackWithOptions(list, stackWidth, 0, borderWidth, Color.green(), false)
    
  // icon column
  let iconColStack = listStack.addStack()
  let iconColLineLeft
  let iconColRowStack
  iconColStack.layoutVertically()
  for (i=0; i<myMuell.length; i++) {
    iconColRowStack = addStackWithOptions(iconColStack, 45, LOGO_SIZE + 2, borderWidth, Color.yellow(), false)
    addLogo(iconColRowStack, myMuell[i].icon)
    iconColStack.addSpacer(3+addSpacer) 
  }
  
  // text + date column
  //let dateColStack = addStackWithOptions(listStack, 100, 0, borderWidth, Color.yellow(), false)
  let dateColStack = listStack.addStack()
  let dateColLineRight
  let dateColRowStack
  dateColStack.layoutVertically()
  for (i=0; i<myMuell.length; i++) {
      dateColRowStack = addStackWithOptions(dateColStack, 100, iconColRowStack.size.height, borderWidth, Color.orange(), true)
      dateColLineRight = dateColRowStack.addText("" + myMuell[i].title  )
      dateColLineRight.font = Font.regularSystemFont(13)
      if ( myMuell[i].date.getFullYear() != WRONG_YEAR ) { 
        dateColLineRight = dateColRowStack.addText("" + dfDate.string( myMuell[i].date ) )
      } else {
        dateColLineRight = dateColRowStack.addText("--")
      }      
      if ( dateColLineRight.text.indexOf(".") == 2 ) { dateColLineRight.text = dateColLineRight.text.replace(".", ",") }  // replace point after short weekday with comma
      dateColLineRight.font = Font.boldSystemFont(13)  
      if ( dateDiffInDays(today, myMuell[i].date ) <= 1) { dateColLineRight.textColor = Color.red() }
      if ( dateDiffInDays(today, myMuell[i].date ) == 2) { dateColLineRight.textColor = Color.orange() } 
      dateColStack.addSpacer(3+addSpacer) 
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
  let date = new Date(WRONG_YEAR, 1, 4)
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
