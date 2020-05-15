# Visualize unstructured data from Watson Discovery in the Cognos Analytics Dashboard

In this section, we will walk you through the process of loading unstructured data from Watson Discovery into Cognos Analytics, where data can be prepared and visualized using data modeling and dashboards.

![architecture](images/architecture-disco.png)

## Flow

1. Product Review data is loaded into Watson Discovery for enrichment. Results include sentiment analysis and keyword discovery.
2. User runs Cognos Analytics.
3. Data files are loaded directly into Cognos Analytics.

## Steps

1. [Clone the repo](#1-clone-the-repo)
1. [Create your Watson Discovery service](#2-create-your-watson-discovery-service)
1. [Configure Watson Discovery](#3-configure-watson-discovery)
1. [Add service credentials to environment file](#4-add-service-credentials-to-environment-file)
1. [Run scripts to generate data](#5-run-scripts-to-generate-data)
1. [Build a Data Module in Cognos Analytics](#6-build-a-data-module-in-cognos-analytics)
1. [Create a Cognos Analytics dashboard](#7-create-a-cognos-analytics-dashboard)
1. [Add visualizations to the dashboard](#8-add-visualizations-to-the-dashboard)
1. [Update Data Module](#9-update-data-module)

## 1. Clone the repo

```bash
git clone https://github.com/IBM/cognos-analytics-using-unstructured-data
```

## 2. Create your Watson Discovery service

To create your Watson Discovery service:

* From your IBM Cloud dashboard, click on `Create resource`.

* Search the catalog for `discovery`.

* Click the `Discovery` tile to launch the create panel.

  ![disco-create-service](images/disco-create-service.png)

  From the panel, enter a unique name, a region and resource group, and a plan type (select the default `lite` plan). Click `Create` to create and enable your service.

## 3. Configure Watson Discovery

### Launch Discovery

From the IBM Cloud dashboard, click on your new Discovery service in the resource list.

  ![disco-launch-service](images/disco-launch-service.png)

From the `Manage` tab panel of your Discovery service, click the `Launch Watson Discovery` button.

### Create a collection

Create a new data collection by selecting the `Update your own data` option. Then provide the data collection a unique name.

  ![disco-create-collection](images/disco-create-collection.png)

### Configure the collection

Click `Configure Data` located in the top-right portion of the panel.

  ![disco-config-icon](images/disco-config-icon.png)

This will bring up the `Enrich fields` tab. Listed will be all of the default enrichments for your collection. We want to add `Keywords` to this list.

Click the `Add enrichments` button.

  ![disco-enrich-fields](images/disco-enrich-fields.png)

In the `Keyword Extraction` panel, click `Add`. Then close the dialog.

  ![disco-add-keyword-enrichment](images/disco-add-keyword-enrichment.png)

The new list of collection enrichments should now include `Keywords`.

  ![disco-apply-to-collection](images/disco-apply-to-collection.png)

Click `Apply changes to collection` to bring up the `Upload documents` dialog.

  ![disco-upload-files](images/disco-upload-files.png)

### Load the product review files

From the `Upload documents` dialog, click `select documents` to bring up the selection list. From there, select all 998 json review files located in the `data/coffee_reviews` directory of your local repo.

Be patient as this process make take several minutes.

  ![disco-loaded-collection](images/disco-loaded-collection.png)

## 4. Add service credentials to environment file

Next, you'll need to add the Watson Discovery credentials to the .env file.

* From the home directory of your cloned local repo, create a .env file by copying it from the sample version

  ```bash
  cp env.sample .env
  ```

* From your Discovery service collection page, locate the credentials for your collection by clicking the dropdown button located at the top right. Copy the Collection ID and Environment ID values.

  ![disco-get-env-ids](images/disco-get-env-ids.png)

* Locate the service credentials listed on the home page of your Discovery service and copy the API Key and URL values.

  ![disco-get-creds](images/disco-get-creds.png)

* Edit the `.env` file with the necessary credentials and settings

  #### `env.sample:`

  ```bash
  # Copy this file to .env and replace the credentials with
  # your own before starting the app.

  # Watson Discovery
  DISCOVERY_URL=<add_discovery_url>
  DISCOVERY_ENVIRONMENT_ID=<add_discovery_environment_id>
  DISCOVERY_COLLECTION_ID=<add_discovery_collection_id>
  DISCOVERY_APIKEY=<add_discovery_apikey>
  ```

## 5. Run scripts to generate data

The provided scripts can be used to generate sample data for a facticious company, Named "Acme Coffee". The company offers 5 types of coffee, which is sold in grocery stores.

The scripts build the following data, which will be output to local .csv files:

* Reviews - this contains all of the reviews for each of the products. Includes rating and sentiment score.
* Products - this is information about each of our products. Includes product_id, name, and unit price.
* Keywords - this contains keywords generated from product reviews.

To run the script you will need to install [Node.js](https://nodejs.org/), an open-source JavaScript run-time environment for executing server-side JavaScript code.

```bash
npm install
cd ca-assets/lib/csv
node generate-product-data.js
```

### Additional scripting information

Outside of the scripts used to build the product and data listed above, there are additonal scripts which were used to generate product review data. The end result of the scripts is the generation of 1000 food review json files that can be loaded into Watson Discovery (see [Step #3](#3-configure-watson-discovery)). Since we have included the 1000 json files in this repo, there is no need to run the scripts again, but it is worth discussing how they work.

#### lib/common/find-products-with-most-reviews.js

1. Download Amazon food review data from [Kaggle](https://www.kaggle.com/snap/amazon-fine-food-reviews).
1. Save as local file `data/Reviews-full.csv`.
1. Process all reviews and log the number of reviews per product, along with how useful each review is based on `helpfullness factor`.
1. Print out the list of products in order of useful reviews.

#### lib/common/generate-disco-input-files.js

1. Use the top 5 reviews determined by `find-products-with-most-reviews`.
1. Cut and paste the product ID of the products associated with these reviews.
1. Add a more user-readable product ID for each.
1. Process all reviews in `data/Reviews-full.csv`, and only process the top 200 useful reviews for the products we have identified.
1. Create a json file for each review and store it in the `data/coffee_reviews` directory.

> **Note**: The actual review dates were spread out from 2008-20017. In order to make the data more relevant to our needs, we modified all dates to be in 2019.

## 6. Build a Data Module in Cognos Analytics

In Cognos Analytics, a `Data Module` serves as a data repository. It can be used to import external data from files on premise, data sources and cloud data sources. Multiple data sources can be shaped, blended, cleansed and joined  together to create a custom, resusable and sharable data module for use in dashboards and reports.

### Upload files into Cognos Analytics

From the Cognos Analytics main dashboard, select the `+` icon in the lower left corner. Select `Upload files`.

From the file selection dialog, select the `csv` files created in the previous script:

* `data/out-products.csv`
* `data/out-reviews.csv`
* `data/out-keywords.csv`

### Create a new Data Module

From the main dashboard, select the `+` icon in the lower left corner. Select `Data module`.

From the source selection panel, select all 3 files and click `OK`.

  ![dm-1-source-selection](images/dm-1-source-selection.png)

The `Data module`panel will be displayed, with the 3 files listed in the left-hand resource list.

Select the `Relationships` tab from the content panel to view the files in the graphic editor. At this point, no relationships will exist.

  ![dm-1-relationships-before](images/dm-1-relationships-before.png)

To create a relationship, right click on the `out-products.csv` file to bring up the context menu. Select `Relationship...`.

  ![dm-1-add-relationship](images/dm-1-add-relationship.png)

From the `Relationship` panel, select `out-reviews.csv` in the `Table 2` drop-down list. Then select `ProductId` for both tables to connect them. Then select the `Match selected columns` button to view the relationship. Click `OK` to save.

  ![dm-1-assign-relationship](images/dm-1-assign-relationship.png)

Repeat the process linking the `out-products.csv` file with `out-keywords.csv`. The end result should result in the following:

  ![dm-1-relationships-after](images/dm-1-relationships-after.png)

Click the `Save` icon in the top menu to save off the `Data module`.

## 7. Create a Cognos Analytics dashboard

In Cognos Analytics, a `Dashboard` provides users a way to communicate insights and analysis of their data. A dashboard view contains visualizations such as graphs, charts, plots, table, maps, or any other visual representation of data.

### Create a Dashboard

From the Cognos Analytics main dashboard, select the `+` icon in the lower left corner. Select `Dashboard`. Accept the default template and click `OK`.

Click `Select a source` to bring up the selction dialog. Select the `Data module` you just created in the previous step, and click `OK`.

  ![db-1-select-source](images/db-1-select-source.png)

Now you should see a blank canvas to create your dashboard.

  ![db-1-blank](images/db-1-blank.png)

From the image above:

* [1] The data module currently associated with the dashboard.
* [2] The resources included in the data module.
* [3] The dashboard canvas.
* [4] The tabs defined for the dashboard.

To create your dashboard, you will need to become knowledgeable with the numerous tools available from icons and pop-up menus.

  ![db-1-tools](images/db-1-tools.png)

From the image above:

* [1] Toggles you between edit and preview mode.
* [2] Toggles display of the resouces (data objects) in the data module.
* [3] An example of one of many drop-down menus associated with data objects.
* [4] Displays the relationship between all of the visual objects on your dashboard. Objects with the same number are related.
* [5] Toggles full-screen mode on and off.
* [6] Toggles display of the filter panels.
* [7] Displays the fields associated with the selected visual object.
* [8] Displays the properties associated with the selected visual object.
* [9] Filters that can be applied to dashboard visual objects. The filter can be set for all dashboard tabs (left side), or for the current tab (righ side).

The types of visualizations available include the following:

  ![db-1-widget-set](images/db-1-widget-set.png)

## 8. Add visualizations to the dashboard

### Product list box

Our first visualization will be a list box containing all of our products. It will also serve as a filter - if a product is selected, all of the other visualizations on the dashboard will change its focus to that product.

Select `out-products.csv -> Product Name` in the resource list and drag it onto the canvas.

  ![db-1-create-list](images/db-1-create-list.png)

The toolbar at the top of the window is active for the currently selected visualization. For convenience, you can click on `Undock toolbar` to have the toolbar snap next to the selected visualization.

  ![db-1-undock-toolbar](images/db-1-undock-toolbar.png).

Click on the anchor icon to bring up the toolbar for the visualization. Then click on the `Change visualization` tool. In this particular case, the default visualization choosen for the data type is a `table`. We need to change this to a `list`.

  ![db-1-change-visualization](images/db-1-change-visualization.png)

From the pop-up menu, click `All visualiztions` to open up the list of available visualizations. Select `list`.

  ![db-1-select-visualization](images/db-1-select-visualization.png)

This will transform out dashboard object from a `table` to a `list`.

From the visualization toolbar, click on the `Edit the title` icon, and set the title to `Products`.

  ![db-1-add-title](images/db-1-add-title.png)

Use the box sizing tools to position the box in the upper left-hand corner of the dashboard.

Use the `Expand/Collapse` button in the upper right-hand corner of your visualization to view in expanded or collapse the view in your dashboard canvas.

  ![db-1-expand-button](images/db-1-expand-button.png)

### Current product ratings

Next we want to show the current ratings for each of our products.

Select `out-reviews.csv -> Rating` and `out-products.csv -> Product Name` from the resource list and drag them onto the canvas.

In this case, we will keep the default visualization, which is a `Column` chart.

Change the title to `Current Products Ratings`

With the `Column` visualization object selected, click `Properties` from the top menu. Click on the `Visualizations` tab, and then click `Axis` to display the available options.

Change `Item axis title` to `Products`, and `Value axis title` to `Ratings`.

  ![db-1-change-axis-label](images/db-1-change-axis-label.png)

You can change the colors used for the bars by selecting `Properties`, `Color` and `Element color`.

  ![db-1-change-element-color](images/db-1-change-element-color.png)

### Current product sentiment

Similar to the `Product Ratings` chart, we want to also show product sentiment. The sentiment score is calculated by Watson Discovery based on the text in the product review.

Select `out-reviews.csv -> Sentiment Score` and `out-products.csv -> Product Name` from the resource list and drag them onto the canvas.

Using the same methods described for `Product Ratings`, change the title, axis labels, and color.

> **Note**: At any time, you can click on the `Edit or preview` button in the main menu bar to toggle between edit and preview mode. Click on `Previe` mode to get a better look at our current dashboard.
>
> ![db-1-edit-or-preview](images/db-1-edit-or-preview.png)
>
> When toggling back to `Edit` mode, you may have to click the `Data` icon (`0111`) to display the resource list. 

### Keyword Word Cloud

For our next visualization, we want to show a `word cloud` of all the keywords detected in the product reviews by Watson Discovery. The keywords listed in the word cloud should be size appropriately to the number of times they are mentioned.

Select `out-keywords.csv -> Keyword` and `out-products.csv -> Product Name` from the resource list and drag them onto the canvas.

Change the visualization type to `Word cloud`.

With the `Word cloud` visualization object selected, click `Fields` from the top menu. To change the source field associated with the color of the keywords, drag the `out-products.csv -> Product Name` from the resource list onto the `Color` label in the field list. This will ensure that the keywords will be displayed in the same color as the product shown in the legend.

  ![db-1-wc-color-product-name](images/db-1-wc-color-product-name.png)

In the same fashion, drag `out-keywords.csv -> Count` from the resouce list onto the `Size` label in the field list. This will make the size of the keyword dependent on the number of times it is mentioned in a review (count).

  ![db-1-wc-count-size](images/db-1-wc-count-size.png)

Click on the `more` button to see more options available from the `Size` field. Select `Filter`, and set the values from 3 to 5. This will ensure that only the most mentioned keywords will show up in the word cloud.

  ![db-1-wc-filter-count-size](images/db-1-wc-filter-count-size.png)

For better readibility, let's make all the keywords horizontal.

With the `Word cloud` visualization object selected, click `Properties` from the top menu. Click on the `Visualizations` tab, and then click `Chart` to display the available options. Click on `Word orientation` and change the value to `Horizontal`.

  ![db-1-wc-horizontal](images/db-1-wc-horizontal.png)

### Product ratings over time

Next we will create a line graph that shows how the product ratings have changed over time.

Select `out-ratings.csv -> Ratings`, `out-ratings.csv -> Time` and `out-products.csv -> Product Name` from the resource list and drag them onto the canvas. We will keep the default visualization, which is a `Line and Column` graph.

As you will initially see, there are way too many graph lines. This is because it is graphing every time value, which is daily. We are only interested in monthly values, so we need to create a "calculation" to get this value.

Right-click on the `out-reviews.csv` file in the resource list, and select `Calculation`.

  ![db-1-out-reviews-calculation-menu](images/db-1-out-reviews-calculation-menu.png)

From the calculation panel, name the calculation `time_to_month`. For the expression, enter `_month()`, then drag the `Time` field inside the brackets. `_month` is a built-in function you can use to retrieve month from a date string.

Hit the `eye` icon to run the function and view the output. Click `OK` to save the calculation.

  ![db-1-add-calculation](images/db-1-add-calculation.png)

Our `time_to_month` calculation should now appear under the `out-reviews.csv` resource list item.

With the `Line and column` graph visualization object selected, click `Fields` from the top menu. Then drag the `time_to_month` calculation from the resource list and drop it onto the `x-axis` label in the field list. The `y-axis` field should remain `Rating`.

Using the `Properties` options, change the axis labels to `Months` and `Ratings`.

Change the title of our visualization object to `Product Ratings over time`.

Use the box sizing tools to position the box in the upper right-hand corner of the dashboard. Our dashboard top row should now look like this:

  ![db-1-top-row](images/db-1-top-row.png)

### Product reviews (positive and negative)

Out final visualizations will be to display actual reviews of the products. We will show both the best and the worst reviews for each product.

To start, we need to create a calculation that spans multiple files. To do this, right-click on the top-most item in our resource list, which is the `Data module`. Then select `Create calculation`.

  ![db-1-top-level-calculation](images/db-1-top-level-calculation.png).

From the calculation panel, name the calculation `product_reviews`. For the expression, drag the `Product Name` field into the expression box, and then do the same with the `Summary` field. Concatenate the 2 fields inserting a `:` between them. Your expression should read:

```bash
out_products_csv.Product_Name || ': ' ||  out_reviews_csv.Summary`
```

Hit the `eye` icon to run the function and view the output. Click `OK` to save the calculation.

  ![db-1-product-reviews-calc](images/db-1-product-reviews-calc.png).

Once the calculation is created, drag the `product_reviews` calculation onto the canvas.

With the visualization selected, click `Fields` from the top menu.

Select `out-reviews.csv -> Rating` from the resource list and drop it onto the`Local filters` label in the field list. Set the filter min and max values to `4` and `5`, which means only the best reviews with be shown.

Repeat this step, but instead use the `out-reviews.csv -> Sentiment Score` resource. In this case, set the filter min and max values to `0.8` to `.99`. Again, this will ensure only the list will only show those reviews with the highest sentiment scores, as defined by Watson Discovery.

  ![db-1-local-filters](images/db-1-local-filters.png).

From the `Fields` menu, in the `product_reviews` object listed under `Columns`, select the  "..." menu, and select the option `Top or bottom`.

Change `Number of results` to `5`, select `Top count`, and set filter to `Sentiment Score`.

  ![db-1-top-count](images/db-1-top-count.png).

Change the title of the visualization to `Positive Reviews`.

Now repeat the steps above to create "Negative Reviews". The only change should be in following:

* `Ratings` from `1` to `2`
* `Sentiment Score` from `- 0.99` to `0`
* `Columns` optioon should be set to `Bottom count`
* Set title to `Negative Reviews`

### Complete and save

Congratulations! You have completed your first Cognos Analytics dashboard. The layout and values should look similar to this:

  ![db-1-final-layout](images/db-1-final-layout.png)

Click the `Save` icon in the top menu to save your dashboard.

#### Dashboard navigation

Now that all of your visualizations are defined and linked correctly, you can manipulate the dashboard using your mouse. If you click on a product name, all of the visualizations will change to focus on that product. The same is true if you click on a store name.

The purpose for the `Product list box` was to provide a convenient focal point for selecting a product, but this can also be achieved by selecting the product name from any of the other visualizations.

## 9. Update Data Module

What do you do if you want to change the underlying data that you used in your dashboard?

The good news is that if you do modify the underlying data, your dashboard will automatically update and reflect the changes.

### Upload new data files

In our example, we are using multiple `csv` files. If any of them have changed, you need to upload the file again.

From the Cognos Analytics main dashboard, select the `+` icon in the lower left corner. Select `Data module`.

From the source selection panel, select the file(s) you want to update and click `OK`.

A confirmation dialog will be displayed asking if you want to `Replace` or `Append` the data. Pick the option most appropriate to handle your changes to the data file.

The next step is to refresh your data module with the new verson of the file(s).

If you currently in the dashboard view, select your data module in the resource list and click the back arrow button.

  ![dm-1-select-dm](images/dm-1-select-dm.png)

Then right-click on your data module listed in the resource list, and select the option `Relink`.

  ![dm-1-relink](images/dm-1-relink.png)

You will then need to confirm which data module you want to replace. Select the data module you have been using with the current dashboard.

  ![dm-1-replace-dm](images/dm-1-replace-dm.png)

This action will cause your dashboard to be refreshed with the new version of the data.

## Next steps

In the next section of this code pattern, we will add more business-related data for our coffee products, store the data in Db2 Warehouse tables, and create more complex dashboard visualizations.

<table border="0">
  <tbody>
    <tr>
      <td align="left"><a href="https://github.com/IBM/cognos-analytics-using-unstructured-data"><img src="images/return-to-main-readme.png"/></a><br/>
        <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
        <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
        <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
        <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
        <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
        <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
        <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
        <span>&nbsp;&nbsp;</span>
      </td>
      <td align="center">
        <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
        <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
        <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
        <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
        <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
        <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
        <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
        <span>&nbsp;&nbsp;</span>
      </td>
      <td align="right"><a href="https://github.com/IBM/cognos-analytics-using-unstructured-data/blob/master/doc/source/business-data.md"><img src="images/proceed-to-next-section.png"/></a><br/>
        <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
        <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
        <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
        <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
        <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
        <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
        <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
        <span>&nbsp;&nbsp;</span>
      </td>
    </tr>
  </tbody>
</table>
