chrome.browserAction.onClicked.addListener(function(tab) {
    chrome.tabs.executeScript(tab.id, {
      code: `
        var projectName = document.title.split(" | ")[0];
        var tasks = [];
        var files = [];
  
        var mandatoryElements = document.querySelectorAll('span.label.label-info');
        mandatoryElements.forEach(function(element) {
          if (element.textContent.trim() === 'mandatory') {
            var taskElement = element.closest('.panel-heading.panel-heading-actions').querySelector('h3.panel-title');
            tasks.push(taskElement.textContent.trim());
          }
        });
  
        var advancedElements = document.querySelectorAll('span.label.label-info');
        advancedElements.forEach(function(element) {
          if (element.textContent.trim() === '#advanced') {
            var taskElement = element.closest('.panel-heading.panel-heading-actions').querySelector('h3.panel-title');
            tasks.push(taskElement.textContent.trim());
          }
        });
  
        var fileElements = document.querySelectorAll('.list-group-item ul li:nth-child(3)');
        fileElements.forEach(function(element, index) {
          var file = element.textContent.trim();
          if (index < tasks.length) {
            var task = tasks[index];
            files.push({ task: task, file: file });
          } else {
            files.push({ task: '', file: file });
          }
        });
  
        [projectName, files];
      `
    }, function(results) {
      var projectName = results[0][0];
      var files = results[0][1];
  
      var copiedText = "# Project Name: " + projectName + "\n\n";
      copiedText += "| Task | File |\n";
      copiedText += "| ---- | ---- |\n";
      files.forEach(function(pair) {
        copiedText += "| " + pair.task + " | " + pair.file + " |\n";
      });
  
      copyToClipboard(copiedText);
      saveToFile(copiedText);
    });
  });

  function copyToClipboard(text) {
    var textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
  }
  
  function saveToFile(text) {
    var blob = new Blob([text], { type: 'text/plain' });
    var fileName = 'README.md';
    var downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = fileName;
    downloadLink.click();
  }