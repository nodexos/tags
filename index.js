function Tags(element,options) {
  this.element = (typeof(element) === 'string') ? document.querySelector(element) : element;

  this.options = Object.assign({
    tagSeparator : ',',
    tagInputDisabled : false,
    tagCssPath : '/style.css'
  },this.element.dataset);

  this.options.tagUnique = this.element.dataset.tagUnique || true;
  this.options.tagSort = (this.element.dataset.tagSort == 'true') ? true : false;
  this.options.tagResizeInput = (this.element.dataset.tagResizeInput == 'true') ? true : false;
  this.options.tagInputDisabled = (this.element.dataset.tagInputDisabled == 'true') ? true : false;

  this.removeSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
  this.separator = this.options.tagSeparator;

  this.wrapper = document.createElement('div');
  this.tagsWrapper = document.createElement('div');
  this.input = document.createElement('input');
  this.input.setAttribute('type','text');
  this.input.count = 0;
  this.element.count = 0;
  this.input.setAttribute('placeholder',this.element.getAttribute('placeholder') || '');
  this.input.classList.add('tag-input');
  this.element.element = this.input;
  this.input.element = this.element;
  if(this.options.tagResizeInput === true) {
    var span = document.createElement('span');
    span.innerText = this.element.getAttribute('placeholder');
    span.style.opacity = 0;
    document.body.appendChild(span);
    var width = span.offsetWidth;
    span.remove();
    this.input.style.width = width + 'px';
  }

  this.wrapper.classList.add('tags-wrapper');
  this.tagsWrapper.classList.add('tags');
  this.element.parentNode.insertBefore(this.wrapper, this.element);
  this.wrapper.appendChild(this.input);
  this.wrapper.appendChild(this.tagsWrapper);
  this.wrapper.appendChild(this.element);
  this.element.style.display = 'none';

  var self = this;

  this.input.add = function(tag){
    self.add(tag);
  };


  this.wrapper.addEventListener('click',function(event){
    if(event.target === self.wrapper) {
      self.input.focus();
    }
  },false);
  this.tagsWrapper.addEventListener('click',function(event){
    if(event.target.closest('.tag-remove')) {
      event.preventDefault();
      self._remove(event.target.closest('.tag'));
    }

  },false);

  this.input.addEventListener('keydown',function(event){
    const key = event.key;
    if(key == self.separator || key == 'Enter') {
      if(self.options.tagInputDisabled === false) {
        self.add(event.target.value);
      }
    }
    if(key == 'Enter') {
      event.preventDefault(); // stop any form submitting!
    }
    if(key === 'Backspace') {
      if(event.target.value === '') {
        self._remove(self.tagsWrapper.lastChild);
      }
    }
  });
  this.input.addEventListener('keyup',function(event){
    const key = event.key;
    if(key == self.separator && self.options.tagInputDisabled === false) {
      event.target.value = '';
    }
  });

  this.element.addEventListener('change',function(event){
    if(self.options.tagSort == true) {
      self.rebuild();
    }
    self.input.count = self.tags().length;
    self.element.count = self.tags().length;
  });

  this.boot = function() {
    var id = 'tags';
    var exists = document.querySelector('#' + id);
    if(!exists) {
      var link = document.createElement('link');
      link.setAttribute('media','all');
      link.setAttribute('rel','stylesheet');
      link.setAttribute('href',self.options.tagCssPath);
      link.setAttribute('id',id);
      document.head.appendChild(link);
    }
    this.rebuild();
  };

  this.tags = function() {
    var tags = this.element.value.split(this.separator);
    tags = tags.filter(function(item){
      return item.length >= 1;
    });
    if(this.options.tagSort === true) {
      tags.sort()
    }
    return tags;
  };

  this.clean = function(value) {
    var pattern = new RegExp(self.separator + "\\s*$");
    return value.trim().replace(pattern, "");
  };

  this.add = function(tag) {
    var value = this.clean(tag);
    if(value === '') {
      return true;
    }
    if(this.options.tagUnique == true) {
      if(this.tags().includes(value)) {
        this.input.value = '';
        this.input.defaultValue = '';
        return true;
      }
    }
    this.input.value = '';
    this.tagsWrapper.insertAdjacentHTML('beforeend',this.build(value));
    this.element.defaultValue = (this.element.defaultValue.length === 0) ? value : this.element.defaultValue + this.separator + value;
    var event = new Event('change');
    this.element.dispatchEvent(event);
  };
  this._remove = function(elem) {
    if(!elem) {
      return true;
    }
    var tag = elem.dataset.tag;
    elem.remove();
    this.element.defaultValue = this.tags().filter(function(item){
      return item !== tag;
    }).join(this.separator);
    this.update();
  };
  this.remove = function(tag) {
    try {
      this._remove(this.tagsWrapper.querySelector('[data-tag="'+tag+'"].tag'));
    } catch(err) {
      console.log('Error: ' + err);
    }
  };
  this.build = function(value) {
    var tag = this.clean(value);
    return '<span class="tag" data-tag="' + tag + '">' + tag + '<a class="tag-remove" href="#" data-tag="' + tag + '">' + self.removeSvg + '</a></span>';
  };

  this.rebuild = function() {
    var html = [];
    this.tags().forEach(function(tag){
      html.push(self.build(tag));
    });
    this.tagsWrapper.innerHTML = html.join("");
    this.update();
  };

  this.update = function() {
    var tags = this.tags();
    this.element.defaultValue = tags.join(self.separator);
  };
  this.boot();

};
export { Tags };