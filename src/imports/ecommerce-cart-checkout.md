Build a compelete  ecommerce shooping cart  and checkout experience that closely follows interaction and design found at https://www.figma.com/proto/K1tKlh4dgeupkTaumfUyOe/Cart-and-Checkout-Designs---UD-3131?node-id=10318-16515&viewport=-1728%2C-703%2C0.46&t=rH569xxBRmavWiUE-1&scaling=min-zoom&content-scaling=fixed&starting-point-node-id=10316%3A6598&page-id=10177%3A3197  Learn it - click around th prototype to understand its full scope of interactivity and associate items and interactions appropiately. 

Cart page Requirements- 
It must be modern in design and code
it must have a “continue shopping” button
it must have a “share a cart” button which opens a modal to create a unique cart link that advises “*VIP enrollment included. Excluded for existing members.”, ask to “add promo code?” and has a text entry continer to enter text, and has buttons for “generate link” and “cancel”. “cance” closes the modal, “generate link” updates the modal with a confirmation message of “LInk Created” and shows the link with supporting text beneath the link advising “*Promotional codes included that expire prior to user loading cart will not be included.” and below that are the social media icons for Facebook, X, Text message, Mail, and URL Lilnk, and below those is a “close” button to close the modal.
it must have a “one-click checkout” button and if it is pressed it creates an MFA modal experience  for choosing either email or sms in acount to send a one time  “code” and after they choose it show a 5 digit numberical entery to type in the code .
it must show all info for each product item(except for membership product line) which include Name, subtitle below, Cost, and “PV” below cost, “Options” as  drop down experience for selecting various product options like flavor, pill size, additional product, * see screen shots reference the experience where it says “your selections” and “flavor” and mimic thos two unique experiences- meaning an array of menu list drop downs to select a different item and a swatch array of diffent collor circles to choose flavor, quantity counter to add and subtract, a subscription toggle to add subscription with conditional text “Will ship and charge on March 10, 2026 and every month until cancelled.” if the toggle is true or on, a Trash icon that removes the product line but has and “undo” action that persists after clicking the trash icon and has an “x” to dismiss the “undo” (wich completely removes the product line item), the membeship product line must have a trash icon too and if it is pressed, the the membership lines change to expresses “Become a VIP member for exclusive savings and rewards plus convenient monthly delivery. ($1.00 fee)” and has a CTA for Add to cart,  All prices of items and PV must be Right aligned, a Prop65 california warning with text “This product can expose you to lead, which is known to the State of California to cause birth defects or other reproductive harm. For more information go to www.P65Warnings.ca.gov.” 
it must have a “Your Cart” section with title “your cart” and in title lists the amount of items and total of only the items cost in parentheses, a section below title that show 3 products where 1 product is a “membership” that costs $1.00 with an item description of “Your Plexus Annual Membership will automatically renew one year from today's date.”, The second item is called “Pink Drink” that cost $79.00.
It must use logic when deleting the membership by showing a full screen modal that references the attached image where it Says “keep VIP benefits” and if the membership is removed, all product prices double and the PV number disappears. It must use logic when deleting a subscription by showing a full screen modal that references the attached image where it Says “keep subscription” It must have an order summary that shows the following, a progress component for earning “free membership” at $35, “free shipping” at $75, and “free Gift” at +$150, that also uses icon star for membership, truck for shipping, and gift for free gift. The total of order moves the progress bar, and it animates to fill. THe names of the products, a single line that totals the “PV” from each product (PV is equal to the dollar cost of the product without cents), a subtotal, shipping at 9.99 unless the progress component has achieved the $75 free shipping mark and then it would show as “Free”, tax at “$—”, estimated total of all product dollar costs, a line of text advising “You’re saving $xx.xx as a VIP” Member, a checkout button that starts the checkout experience, a paypal button.
it must have an “suggested products” below the cart items and order summary that suggest 3 products and they each have an add to cart cta.

Checkout page requirements -
Rewards that were earned based on cart amount must be shown in the order summary
it must be consistent to the design of cart UI It must have editble sections for shipping, payment, and Review,  and nuances of billing address is different than shipping address, ability to save and edit and cancel edits
It must have address validation in shipping
It must have options for payment method including, credit/debit with correct fields, Venmo, Paypal, and a “voucher” that is a free text field that accepts numerical charcters only
it mus have links to “Refund Policy” “Shipping” “Privacy Policy” “Terms of Service”

Confirmation page requirement - 
it must be consistent to the design of cart UI and checkout page
It must be a gratefull and thankful expression for the order
it must explain an estimated date of delivery
it must have a cta to “go to my account”
it must show the final order summary that was purchased and it breakdown of costs
it must show name of who it is shipped to
it mush show address of where it is shipping to
it must show the current state of the order. like “Being proccessed” 
there must be a cta to “share your  cart” thre must be a ‘invite’ section to enter an email that will send to the email entererd
There must be a section of “we care about your experience” - take a one minute survey
THere must be a section of “products to complete your health journey” with a listing of 3 products with CTA for adding to cart.

In one prompt, you may ask up to 5 questions to gain further insight to building this.