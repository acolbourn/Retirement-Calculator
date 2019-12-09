# Retirement-Calculator
A live version of the site can be found here:
https://affectionate-bhabha-988fc4.netlify.com

This site is a visual retirement calculator made with D3, Javascript, HTML, and CSS.  It provides an easy way to visualize the power of compounding interest and demonstrates why the power of time is so critical in retirement planning.  The design is intended primarily as a motivational tool to encourage people to start saving early.  As such, the interface is designed to be as simple as possible.  Factors such as tax implications, inflation, pensions, social security, and other complex considerations are not included. 

# Getting Started
The calculator has only five available options that were carefully selected to yield an accurate ballpark estimate of interest growth with as little preliminary knowledge as possible.  The user simply inputs their current age, retirement age, starting investment, monthly contributions, and interest rate. When the calculate button is pressed, a bar graph is generated showing the growth over time.  By clicking/hovering on a year the user can see the results at various points in time.  In addition, a summary of the final key results is displayed at the bottom of the page.   

# Calculation Notes
A default interest rate of 7% stock growth was selected after looking at dozens of sources.  Between 6% and 7% is a historically safe number to use but some sources suggest as high as 11.9%.  If you are getting above this, please contact me with your stock tips.

Interest is compounded monthly and the option to change this was removed to simplify the interface.  After running many compounding interval scenarios, I found the difference between options to be negligible and the added complexity for users was not worth it for a ballpark estimate like this.  

For more info on the calculations used see the acknowledgement section below.

# Built With
https://d3js.org/ - The graphing framework used.

# License
Anyone is welcome to use and build on this work, please let me know if you do so I can see what you make!

# Acknowledgments
I want to thank Alastair Hazell for his work in compiling the formulas I used.  Please check out his website which has excellent detailed explanations of all the calculations: https://www.thecalculatorsite.com/articles/finance/compound-interest-formula.php

The following calculators were used to verify the results and all provide additional useful info for those looking to delve into this deeper: 
https://www.thecalculatorsite.com/finance/calculators/compoundinterestcalculator.php
https://www.nerdwallet.com/banking/calculator/compound-interest-calculator
https://www.bankrate.com/calculators/savings/compound-savings-calculator-tool.aspx
