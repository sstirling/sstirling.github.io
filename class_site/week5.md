#Tables! 

Tables are an effective way of organizing a few things, or data you want to compare. They are not, however, ideal for organizing the design on your webiste. 

You'll be using tables to create an icon chart as part of your project, due next week.  

## Table Structure 

The HTML for tables is a good example of nesting. They are made up of several components. 

`<table>
	<tr>
		<th>I'm a header</th> <!-- new colum can go right next to it '--->' -----> <th>I'm a header</th>
	<tr>
		<td>I'm the first row of data</td><td>I'm the second column's data</td>
</table> `

### `<table></table>` : The main tag for your table. every aspect of it goes within these tags

### `<tr></tr>` : Stands for table row. Use it every time you want to start a new row.

### `<th></th>` : Stands for table header. Use if you want the top row to have bolded labels. 

### `<td></td>` : Table data. Where the information you want to display goes. 

## An example

`<table>
	<h4>Climate change position among scientists</h4>
	<tr>
		<th>Profession</th><th>Believers</th><th>Skeptics</th></tr>
	<tr>
		<td>Climatologists</td><td>95%</td><td>5%</td></tr>
	<tr>
		<td>Meteorologists</td><td>5%</td><td>95%</td></tr>
</table>