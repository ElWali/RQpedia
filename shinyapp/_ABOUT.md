[![MedAfrica][logo_medafrica]][url_medafrica]
[![McDonald][logo_mcd]][url_mcd]
[![UCAM][logo_ucam]][url_ucam]
[![RCarbon][logo_rcarbon]][url_rcarbon]
[![Leverhulme][logo_leverhulme]][url_leverhulme]
[![ISMEO][logo_ismeo]][url_ismeo]

# About the MedAfrica project and MedAfriCarbon database

The [MedAfrica Project][url_medafrica] set out to produce the first comprehensive, empirical and interpretative synthesis of long-term social and economic dynamics on the African flank of the Mediterranean between the beginning of the Holocene (ca. 9600 BC) and the arrival of Phoenicians and Greeks (between 800 and 600 BC), and to identify major factors shaping the patterns detected.

To address these questions, a large and up-to-date database of published radiocarbon dates was assembled with a systematic association of key cultural markers (e.g. presence/absence of domestic/wild species and material culture elements), allowing the first comprehensive chronological and cultural story for the prehistory of this region to emerge for a generation. These questions are explored as part of the interpretative synthesis presented in [Broodbank and Lucarini (2019)][url_medafrica]. The final database is presented here in the form of a user-friendly web app, to facilitate data exploration and informal analysis.

For more information about the database, see the open data publication [Lucarini et al. (2020)](https://dx.doi.org/10.5281/zenodo.3630620), or click on the `Download` tab.

![MedAfricaCarbon][logo_medafricarbon]

## About the **MedAfriCarbon** web app

The MedAfricaCarbon web app provides a graphical interface to explore the MedAfrica database, based on the Shiny platform ([Chang et al. 2019](https://CRAN.R-project.org/package=shiny)). The app is structured as a tabbed dashboard with six major tabs (About; Map explorer; Dates explorer; Individual calibration; SPD (beta); Download; Bibliography). The default tab on opening the app is the `Map explorer`. Some of the tabs are synchronised, so that, for example, a filter selection made in the `Map explorer` will also appear in the `Dates explorer` and vice-versa. The `Calibration` and `SPD` tabs are linked but not synchronised to the explorer tabs.

### **About** tab

This tab provides an overview and introductory information about the MedAfrica Project “Archaeological deep history and dynamics of Mediterranean Africa, ca. 9600-700 BC”, acknowledgements and credits as well as some basic tutorial instructions for use of the app.

### **Map explorer** tab

In the `Map explorer` tab, the locations of radiocarbon dates are visualized on an interactive and zoomable map. Each date is represented by a single point; hovering over a point with the cursor shows the site name, and clicking on the point opens a popup with headline information about the date (unique identifier; uncalibrated date; median calibrated date; site name; material; site context). By clicking on `More details`, the user is transferred to the `Calibration` tab with all the fields related to that specific date (see below).

A number of filtering or search options are provided by the `Map explorer` (most of which are automatically synchronised in the `Dates explorer` tab). Dates can be visualised and filtered in two date formats: by uncalibrated bp or by median calibrated BP. Dates can be filtered geographically, either by entering the name of the site(s) in the “select sites” pane, or by using the polygon selection button on the top left of the page. Dates can also be filtered chronologically, by entering the maximum and minimum chronological bounds (the order is not important) using the two `w/date range from: to:` input boxes. Dates with overly large uncalibrated errors can be visually differentiated by adjusting the `Max uncal. error` menu box: in the map view, these dates will appear as small white dots instead of coloured ones.

The dates can be filtered out according to one or more economic or cultural using the `Phase association(s)` input box. The filter can match with one of two methods `Any (union)` or `All (intersect)`. The first option is cumulative and shows all the radiocarbon dates associated to the two (or more) economic and/or cultural attributes, considered singularly. The second one shows instead all the radiocarbon dates in which the two (or more) economic and/or cultural attributes are associated to the same date(s). The associations that can be searched include presence/absence values for: _domestic cattle; wild cattle; undetermined bovids; domestic sheep/goats; wild barbary sheep; domestic donkeys; wild donkeys / zebras; domestic horses; undetermined equids; domestic pigs; ostrich eggshells; ostrich bones; other wild terrestrial macrofauna; other wild terrestrial microfauna / avifauna; terrestrial / freshwater molluscs; marine molluscs; ichthyofauna / turtles; domestic cereals; domestic pulses; fruit crops; wild plants; pottery; lithics: backed tools / geometrics; lithics: notches / denticulates; lithics: bifacial tools; lithics: polished axes / adzes_.

We did not report the economic and cultural associations for the 14C dates coming from the early Egyptian royal and elite cemeteries along the Nile between Abu Roash and Illahun.

When at least one economic or cultural association is selected a `with any following value(s)` selection box appears. Multiple options can be chosen in an additive way (i.e. any values will be matched): the options are:- “definite presence”; “low presence” (definite presence in low frequency); “unconfirmed” (unconfirmed presence); “absence of evidence”; or “no data” (i.e. where specific study/analysis has not been carried out yet and so no data are available).

Finally, although we consider cultural-chronological phases problematic, dates can also be filtered according to traditional cultural phase definitions (e.g. “Bronze Age”), even if these periods should be treated with caution. In order to facilitate the grouping of different cultural classifications which fall within the same macro-cultural definition we also decided to set the cultural phasing hierarchically, up to 4 levels (e.g. cultural phasing 1: Bronze Age; 2: Middle Kingdom; 3: Dynasty 12; 4: Amenemhet III). For example, selecting the cultural phase level 1 (top right window), the web app will show all the radiocarbon dates that have been associate to different cultural definitions that can be included in the macro cultural group defined as Bronze Age).

Filters can be reset using the `Clear sites filter` and `Reset other filters` buttons at the bottom of the tab.

Once groups of dates have been filtered, spatially, chronologically or by phase association, these can also be viewed as a list by clicking on the `-> as table` button on the bottom right corner, which will open the `Dates explorer` tab, or transferred to the `SPD` tab in order to calculate a Summed Probability Distribution graph for the selected dates by clicking on the `-> SPD` button.

### **Dates explorer** tab

In the `Dates explorer` tab, filtered dates are visualised using an interactive list table. The available filters are essentially identical to the `Map explorer` tab, and, moreover are synchronised so that the list shown on `Dates explorer` matches the points shown on the `Map explorer`. In the case of the `Dates explorer`, dates with errors above the selected maximum are shown in red text. Clicking on `More detail` opens the `Calibration` tab for that date, and clicking on `Show on map` opens the `Map explorer` tab at the site’s position. To select sites by spatial location, sites can be searched for, or the polygon tool on the `Map explorer` tab can first be used and then dates will be ready-filtered in the `Dates explorer` list.
The listed radiocarbon dates can be downloaded in CSV format using the `Download as CSV` button; note this download includes only the basic information about the dates (e.g. identifier, CRA and error) and does not include the cultural phase associations or site information. The full database can be downloaded from the `Download` tab. The selected dates can also be transferred to the `SPD` tab for graphical analysis.

### **Calibration** tab

The `Calibration` tab contains all the information relative to each radiocarbon date, i.e. _Lab-ID, other Lab-ID (when applicable), CRA, error, possible isotopic signatures (e.g. δ13C), dated material and possible species, date method, calibration curve, local reservoir 14C and local reservoir 14C error; Sample ID; Site Context_. All the cultural and economic associations (listed above) are also reported here. It also provides a single plot representing the probability distribution of the calibration of the date using the appropriate calibration curve. The calibration relies on the `calibrate` function in the `rcarbon` package (see stable version [on CRAN](https://CRAN.R-project.org/package=rcarbon) or beta versions [on GitHub](https://github.com/ahb108/rcarbon)).

Bibliographic references to the individual date, or to the relevant cultural phase are listed underneath the calibration plot.

### **SPD** tab

The `SPD` tab enables the user to produce a Summed Probability Distribution graph using all dates in the database; the dates previously selected from the `Map explorer` or `Dates explorer` tabs; or by manually entering the unique Lab_ID identifiers for the date. [**Explanation of What is SPD?**]. The SPD graph, generated using the `spd` function in `rcarbon`, shows: raw SPD based on a selected bin value (in blue); a 200yr rolling average smoother function (in red) to remind users not to over-interpret narrow spikes; and a barcode indicator (in black) to visualise the density of dates along the range. Note that while some caching is used to speed up the calculation and plotting of SPD graphs, any novel SPDs (i.e. graphs which have not been previously generated) may be slow to load. The density binning value can be adjusted, and dates can be filtered by the maximum uncalibrated error value.

### **Download** tab

From this tab the user can find a link to download the full MedAfriCarbon database.

### **Bibliography** tab

This tab provides a comprehensive bibliography of all references in the database. Where URLs were available, links to the publications are also made, so that such references are clickable.

## References

Broodbank, C and Lucarini, G. 2019. The Dynamics of Mediterranean Africa, ca. 9600-1000 BC: An Interpretative Synthesis of Knowns and Unknowns. _Journal of Mediterranean Archaeology_, 32.2: 195-268.

Chang, W, Cheng, J, Allaire JJ, Xie, Y and McPherson J. 2019. _shiny: Web Application Framework for R. R package version 1.3.2_. https://CRAN.R-project.org/package=shiny

Giulio Lucarini, Toby Wilkinson, Enrico R. Crema, Augusto Palombini,
Andrew Bevan, Cyprian Broodbank. 2020. The MedAfriCarbon radiocarbon
database and web application. Archaeological dynamics in Mediterranean
Africa, ca. 9600-700 BC. _Journal of Open Archaeology Data_. https://dx.doi.org/10.5281/zenodo.3630620.

## Project Funding

We would like to acknowledge our gratitude to the MedAfrica project funders. The [Leverhulme Trust][url_leverhulme] provided the core funding for the Archaeological deep history and dynamics of Mediterranean Africa, ca. 9600-700 BC, “MedAfrica” Research Project (RPG-2016-261). Additional financial support to the project came from the [McDonald Institute for Archaeological Research][url_mcd] and the Italian Ministry of Foreign Affairs and International Cooperation, and IPOCAN, MIUR project, via the [ISMEO (International Association for Mediterranean and Oriental Studies)][url_ismeo].

## Acknowledgements

We warmly thank _Nabiha Aouadi, Louiza Aoudia, Nadia Bahra, Barbara E. Barich, Graeme Barker, Lotfi Belhouchet, Youssef Bokbot, Abdeljalil Bouzouggar, Alfredo Coppa, Katerina Douka, Julie Dunne, Lucy Farr, Evan Hill, Christopher Hunt, Mary Jackes, Karin Kindermann, Jörg Linstädter, Veerle Linseele, David Lubell, Agnieszka Mączyńska, Katie Manning, Abdeslam Mikdad, Simone Mulazzani, Giuseppina Mutri, Thomas Perrin, Giacoma Petrullo, Heiko Riemer, Joanne Rowland, and Geoffrey J. Tassie†_. Our gratitude also goes to _Kimberley Watt_ for her work on the reference database, and to _David Redhouse_ for his technical support in setting up the Cambridge Shiny server.

## Future updates

Colleagues who wish to share new published archaeological 14C dates from the Mediterranean Africa, or to report any missing or incorrect information in the already published dataset of dates and economic/cultural associations are very much welcome to contact Giulio Lucarini at [giulio.lucarini@cnr.it](mailto:giulio.lucarini@cnr.it).

We plan to update the web app and public database approximately every 6 months, where there are new additions.


[logo_medafrica]: www/medafrica.png "MedAfrica"
[logo_medafricarbon]: www/medafricarbon.png "MedAfriCarbon"
[logo_mcd]: www/mcdonald.png "McDonald Institute"
[logo_ucam]: www/ucam.png "University of Cambridge"
[logo_rcarbon]: www/rcarbon.png "rcarbon package"
[logo_leverhulme]: www/leverhulme.png "Leverhulme"
[logo_ismeo]: www/ismeo.png "ISMEO"
[url_medafrica]: http://www.medafrica-cam.org/
[url_mcd]: https://www.mcdonald.cam.ac.uk/
[url_ucam]: https://www.cam.ac.uk/
[url_rcarbon]: https://cran.r-project.org/web/packages/rcarbon/vignettes/rcarbon.html
[url_leverhulme]: https://www.leverhulme.ac.uk/
[url_ismeo]: http://www.ismeo.eu/
