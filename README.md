# README

Lightweight tag system

## Usage


```html
<input type="text" class="tags" data-tag-separator="," />

<script type="module">
  import { Tags } from '/path/to/tags/index.js';

  var element = new Tags(document.querySelector('.tags'),{

  }); // element or string which will be used as selector

</script>
```

### Options

```javascript
{
  tagSeparator: ',',
  tagInputDisabled: false, // disables the input (good for using with suggestive)
  tagCssPath :  '/style.css', // path to the css file which is auto appended to document head
  tagUnique: true, // whether duplicate tags are allowed
  tagSort : false, // whether to alphabetically sort the tags when adding one
  tagResizeInput : false // whether to resize the input initial width to the width of the placeholder
}
```
All of the options can also be sent as data attributes on the main tag input such as `data-tag-separator=";"`

Pressing the `enter` key or the tag separator key will finish the current tag selection and add it to the tag list (subject to uniqueness checks etc)

Pressing `backspace` will delete the tag behind the current cursor as will clicking the delete cross on each tag

### Tags in action

![Screenshot](/screenshot.png?raw=true&v=0.01 "Screenshot")