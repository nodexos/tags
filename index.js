function Tags(element, options) {
  this.element = (typeof (element) === 'string') ? document.querySelector(element) : element;

  this.options = Object.assign({
    tagSeparator: ',',
    tagInputDisabled: false,
    tagCssPath: './style.css',
    tagDraggable: 'true'
  }, this.element.dataset);

  this.options.tagUnique = this.element.dataset.tagUnique || true;
  this.options.tagSort = (this.element.dataset.tagSort == 'true') ? true : false;
  this.options.tagResizeInput = (this.element.dataset.tagResizeInput == 'true') ? true : false;
  this.options.tagInputDisabled = (this.element.dataset.tagInputDisabled == 'true') ? true : false;
  this.options.isDraggable = (this.options.tagDraggable === 'true') ? true : false;
  this.options.isSuggestive = this.element.dataset.tagSuggestions || this.element.dataset.tagSuggestionsUrl || false;
  this.options.isSuggestiveRemote = this.element.dataset.tagSuggestionsUrl || false;
  
  
  this.options.suggestionsIsRemote = (this.options.isSuggestive !== false && this.options.isSuggestiveRemote !== false);
  
  this.removeSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
  this.separator = this.options.tagSeparator;

  this.wrapper = document.createElement('div');
  this.tagsWrapper = document.createElement('div');
  this.input = document.createElement('input');
  this.dropdown = null;
  this.input.setAttribute('type', 'text');
  this.input.count = 0;
  this.element.count = 0;
  this.input.setAttribute('placeholder', this.element.getAttribute('placeholder') || '');
  this.input.classList.add('tag-input');
  this.element.element = this.input;
  this.input.element = this.element;
  if (this.options.tagResizeInput === true) {
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
  this.element.tags = [];
  var self = this;

  this.input.add = function (tag) {
    self.add(tag);
  };


  this.wrapper.addEventListener('click', function (event) {
    if (event.target === self.wrapper) {
      self.input.focus();
    }
  }, false);

  this.tagsWrapper.addEventListener('click', function (event) {
    if (event.target.closest('.tag-remove')) {
      event.preventDefault();
      self._remove(event.target.closest('.tag'));
    }

  }, false);

  var srcEl;

  function setupDragging(element) {

    element.addEventListener('dragstart', function (event) {
      this.classList.add('tag-dragging');
      srcEl = this;
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/html', this.innerHTML);
      event.dataTransfer.setData('text/plain', this.dataset.tag);
    }, true);
    element.addEventListener('dragover', function (event) {
      event.preventDefault();
      this.classList.add('tag-dragover');
    }, true);
    element.addEventListener('dragenter', function (event) {
      this.classList.add('tag-dragover');
      //direction = 'before';
    }, true);
    element.addEventListener('dragend', function (event) {
      this.classList.remove(...['tag-dragover', 'tag-dragging']);
    }, true);
    element.addEventListener('dragleave', function (event) {
      self.tagsWrapper.querySelectorAll('[draggable="true"]').forEach((item) => {
        item.classList.remove('tag-dragover');
      });
    }, true);
    element.addEventListener('drop', function (event) {
      event.stopPropagation();
      event.preventDefault();

      if (srcEl !== this) {
        srcEl.innerHTML = this.innerHTML;
        srcEl.dataset.tag = this.dataset.tag;
        this.innerHTML = event.dataTransfer.getData('text/html');
        this.dataset.tag = event.dataTransfer.getData('text/plain');

      }
      var items = [];
      self.tagsWrapper.querySelectorAll('[draggable="true"]').forEach((item) => {
        item.classList.remove('tag-dragover');
        items.push(item.dataset.tag);
      });
      self.element.defaultValue = items.join(self.separator);
      return false;
    }, true);
  };
  if (this.options.isDraggable) {
    this.options.tagSort = false;
    var observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        mutation.addedNodes.forEach(function (element) {
          setupDragging(element);
        });
      });
    });
    observer.observe(this.tagsWrapper, {
      attributes: false,
      childList: true,
      characterData: false,
      subtree: false
    });

  }
  if (this.options.isSuggestive) {
    
    this.input.addEventListener('focus', function focus(event) {
      if(self.options.suggestionsIsRemote) {
        fetch(self.options.tagSuggestionsUrl)
        .then(response => response.json())
        .then(function (data) {
          var suggestions = [];
          data.forEach(function (item) {
            suggestions.push({ key: item.toLowerCase(), value: item });
          });
          self.suggestions = suggestions;
        });
      } else {
        const items = self.element.dataset.tagSuggestions;
        var suggestions = [];

        items.split(self.options.tagSeparator).forEach(function(item){
          suggestions.push({ key: item.toLowerCase(), value: item });
        });
        self.suggestions = suggestions;
      }
      
    },{once:true});
    // create a dropdown //
    this.dropdown = document.createElement('ul');
    this.dropdown.classList.add('tags-suggestive');
    this.wrapper.append(this.dropdown);

  }
  this.input.addEventListener('keydown', function (event) {
    const key = event.key;
    if (key == self.separator || key == 'Enter') {
      if (self.options.tagInputDisabled === false) {
        self.add(event.target.value);
      }
    }
    if (key == 'Enter') {
      event.preventDefault(); // stop any form submitting!
    }
    if (key === 'Backspace') {
      if (event.target.value === '') {
        self._remove(self.tagsWrapper.lastChild);
      }
    }

  });
  this.input.addEventListener('blur', function (event) {
    if (self.options.tagInputDisabled === false) {
      self.add(event.target.value);
    }
  });
  if (this.options.isSuggestive) {
    this.dropdown.addEventListener('mousedown', function (event) {
      event.preventDefault();
      if(event.target.dataset.value) {
        self.add(event.target.dataset.value);
        self.input.dispatchEvent(new Event('keyup'));
      }
    });
    this.input.addEventListener('keyup', function (event) {
      var value = event.target.value.toLowerCase();
      //console.log(value.length);
      if(value.length <= 0) {
        self.dropdown.classList.remove('tags-suggestive-visible');
        return true;
      }
      var suggestions = self.suggestions.filter(function (item) {
        //console.log(self.tags());
        return item.key.includes(value) && !self.tags().includes(item.value);
      });
      //console.log(suggestions);
      var html = '';
      suggestions.forEach(function (item) {
        html += '<li data-value="' + item.value + '">' + item.value + '</li>';
      });
      self.dropdown.innerHTML = html;
      //if(suggestions.length >= 1) {
        self.dropdown.classList.toggle('tags-suggestive-visible', suggestions.length >= 1);
      //}
      //console.log(suggestions);
    });
  }

  this.input.addEventListener('keyup', function (event) {
    const key = event.key;
    if (key == self.separator && self.options.tagInputDisabled === false) {
      event.target.value = '';
    }
  });
  this.element.addEventListener('updated', function (event) {
    self.rebuild();
    self.input.count = self.tags().length;
    self.element.count = self.tags().length;

  });
  this.element.addEventListener('change', function (event) {
    if (self.options.tagSort == true) {
      self.rebuild();
    }
    self.input.count = self.tags().length;
    self.element.count = self.tags().length;
    self.wrapper.dataset.numTags = self.element.count;
    self.element.tags = self.tags();
    //this.element.prototype.tags = self.tags();
    //console.log('Setting element tags to: ' + self.tags() );
  });

  this.boot = function () {
    var id = 'fabric-tags';
    var exists = document.querySelector('#' + id);
    if (!exists) {
      var link = document.createElement('link');
      link.setAttribute('media', 'all');
      link.setAttribute('rel', 'stylesheet');
      link.setAttribute('href', self.options.tagCssPath);
      link.setAttribute('id', id);
      document.head.appendChild(link);
    }
    this.rebuild();
    //console.log(this.options.isDraggable);
    if (this.options.isDraggable === true) {

    }
  };

  this.tags = function () {
    var tags = this.element.value.split(this.separator);
    tags = tags.filter(function (item) {
      return item.length >= 1;
    });
    if (this.options.tagSort === true) {
      tags.sort()
    }
    return tags;
  };

  this.clean = function (value) {
    var pattern = new RegExp(self.separator + "\\s*$");
    return value.trim().replace(pattern, "");
  };

  this.add = function (tag) {
    var value = this.clean(tag);
    if (value === '') {
      return true;
    }
    if (this.options.tagUnique == true) {

      if (this.tags().includes(value)) {
        this.input.value = '';
        this.input.defaultValue = '';
        return true;
      }
    }
    this.input.value = '';
    this.tagsWrapper.insertAdjacentHTML('beforeend', this.build(value));

    this.element.defaultValue = (this.element.defaultValue.length === 0) ? value : this.element.defaultValue + this.separator + value;
    //var event = new Event('change');
    this.element.dispatchEvent(new Event('change'));
    this.element.dispatchEvent(new CustomEvent('added',{detail: value}));
  };

  this.element.add = function (tag) {
    var tags = (typeof (tag) === 'string') ? [tag] : tag;
    tags.forEach(function (item) {
      self.add(item);
    });
  };
  this.element.empty = function () {
    self.element.value = '';
    self.rebuild();
  };
  this._remove = function (elem) {
    if (!elem) {
      return true;
    }
    var tag = elem.dataset.tag;
    elem.remove();
    this.element.defaultValue = this.tags().filter(function (item) {
      return item !== tag;
    }).join(this.separator);
    this.update();
    this.element.dispatchEvent(new CustomEvent('removed',{detail: tag}));
    this.element.dispatchEvent(new Event('change'));

  };
  this.remove = function (tag) {
    try {
      this._remove(this.tagsWrapper.querySelector('[data-tag="' + tag + '"].tag'));
    } catch (err) {
      console.log('Error: ' + err);
    }
  };
  this.build = function (value) {
    var tag = this.clean(value);
    return '<span class="tag" data-tag="' + tag + '" draggable="' + self.options.tagDraggable + '">' + tag + '<a class="tag-remove" href="#" data-tag="' + tag + '">' + self.removeSvg + '</a></span>';
  };

  this.rebuild = function () {
    var html = [];
    this.tags().forEach(function (tag) {
      html.push(self.build(tag));
    });
    this.tagsWrapper.innerHTML = html.join("");
    this.update();
  };

  this.update = function () {
    var tags = this.tags();
    this.element.defaultValue = tags.join(this.separator);
    this.element.dispatchEvent(new Event('change'));
  };
  this.boot();
  return this.element;
};
window.Tags = Tags;
// then inside anywhere that uses it we need to make sure it's loaded using window.addEventListener('DOMContentLoaded', (event) => {});
export { Tags };