const puppeteer = require('puppeteer');
const fs = require('fs')

const getContacts = async (email,password) => {
    const browser = await puppeteer.launch({
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu',
          '--window-size=1920x1080',
        ],
        ///*
          headless: false, // launch headful mode
          //slowMo: 1000, // slow down puppeteer script so that it's easier to follow visually
        //*/
        });

        
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    const blockedResourceTypes = [
      'image',
      'media',
      'font',
      'texttrack',
      'object',
      'beacon',
      'csp_report',
      'imageset',
      'stylesheet',
    ];

    const skippedResources = [
      'quantserve',
      'adzerk',
      'doubleclick',
      'adition',
      'exelator',
      'sharethrough',
      'cdn.api.twitter',
      'google-analytics',
      'googletagmanager',
      'fontawesome',
      'facebook',
      'analytics',
      'optimizely',
      'clicktale',
      'mixpanel',
      'zedo',
      'clicksor',
      'tiqcdn',
    ];
    page.on('request', (req) => {
      const requestUrl = req._url.split('?')[0].split('#')[0];
      if (
        blockedResourceTypes.indexOf(req.resourceType()) !== -1 ||
        skippedResources.some(resource => requestUrl.indexOf(resource) !== -1)
      ) {
        req.abort();
      } else {
        req.continue();
    }
    });
    
    console.log("1");

    await page.goto('https://contacts.google.com/directory', {waitUntil: 'domcontentloaded'})
    console.log("2");
    page.evaluate((val)=>{
        document.getElementById("identifierId").value = val;
        document.getElementsByClassName("Vwe4Vb MbhUzd")[0].click()
    },email)
    await page.waitForNavigation({ waitUntil: 'networkidle0' })
    console.log("DOEN")
    page.evaluate((val)=>{
        document.getElementsByClassName ("whsOnd zHQkBf")[0].value = val;
        document.getElementsByClassName("Vwe4Vb MbhUzd")[0].click()
    },password)
    await page.waitForNavigation({ waitUntil: 'networkidle0' })

    /*

    for(contact of document.getElementsByClassName("zYQnTe")){
        let name = contact.getElementsByClassName("PDfZbf")[0].innerText
        let email = contact.getElementsByClassName("hUL4le")[0].innerText
        contacts.push({name:name,email:email})
    }


        const scrollMax;
        do{

        }while(document.getElementsByClassName("bhb7sf").scrollTop!=scrollMax)
    */

    let contacts = await page.evaluate(()=>{
        let contacts = [];
        for(contact of document.getElementsByClassName("zYQnTe")){
            let name = contact.getElementsByClassName("PDfZbf")[0].innerText
            let email = contact.getElementsByClassName("hUL4le")[0].innerText
            contacts.push({name:name,email:email})
        }
        return contacts
    })
    console.log(contacts)
    let scrollMax = await page.evaluate(()=>{
        return document.getElementsByClassName("zQTmif SSPGKf eejsDc")[0].scrollHeight-document.getElementsByClassName("zQTmif SSPGKf eejsDc")[0].clientHeight
    })
    console.log(scrollMax)
    let currentScroll = 0;
    do{
        //Scroll down
        await page.evaluate(()=>{
            document.getElementsByClassName("E6Tb7b psZcEd")[document.getElementsByClassName("E6Tb7b psZcEd").length-1].scrollIntoView()
        })

        //Get contacts
        console.log("Scroll Down")
        let arr = await page.evaluate((contactsSoFar)=>{
            let loopNum = 0;
            let contacts = [];
            for(contact of document.getElementsByClassName("zYQnTe")){
                loopNum++
                if(loopNum>2){
                    let name = contact.getElementsByClassName("PDfZbf")[0].innerText
                    let email = contact.getElementsByClassName("hUL4le")[0].innerText
                    if(contactsSoFar.map(function(e) { return e.email; }).indexOf(email)!=-1){
                        console.log(contacts.indexOf({name:name,email:email}));
                        break;
                    }
                    contacts.push({name:name,email:email})
                }
            }
            return contacts
        },contacts) 
        contacts = contacts.concat(arr);
        console.log(arr)
        currentScroll = await page.evaluate(()=>{
            return document.getElementsByClassName("zQTmif SSPGKf eejsDc")[0].scrollTop
        });
        console.log(currentScroll)
    }while(currentScroll!=scrollMax)
    try {
        fs.writeFileSync('output.json', JSON.stringify(contacts))
      } catch (err) {
        console.error(err)
      }
      console.log("DONE")
}

getContacts("10013096@sbstudents.org","***REMOVED***")