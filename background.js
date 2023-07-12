chrome.browserAction.onClicked.addListener(function(tab) {
  if (tab.url.startsWith('https://intranet.alxswe.com/projects/')){
  chrome.tabs.executeScript(tab.id, {
    code: `
      var projectName = document.title.split(" | ")[0];
      var tasks = [];
      var files = [];
      var learningObjectives = [];
      var resources = [];

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

      var learningObjectiveElements = document.querySelectorAll('h3');
      var generalHeadingIndex = -1;
      learningObjectiveElements.forEach(function(element, index) {
        if (element.textContent.trim() === 'General' && generalHeadingIndex === -1) {
          generalHeadingIndex = index;
        }
      });

      if (generalHeadingIndex !== -1) {
        var objectives = [];
        var listElements = learningObjectiveElements[generalHeadingIndex].nextElementSibling.querySelectorAll('li');
        listElements.forEach(function(liElement) {
          objectives.push(liElement.textContent.trim());
        });
        learningObjectives.push({ category: 'General', objectives: objectives });
      }

      var panelBody = document.querySelector(".panel-body");
      var sectionList = panelBody.querySelector("ul");
      var listItems = sectionList.querySelectorAll("li");

      listItems.forEach(function(item) {
        var link = item.querySelector("a");
        var url = link.href;
        var title = link.title;

        resources.push({ resource: title, link: url });
      });

      [projectName, files, learningObjectives, resources];
    `
  }, function(results) {
    var projectName = results[0][0];
    var files = results[0][1];
    var learningObjectives = results[0][2];
    var resources = results[0][3];

    var copiedText = "# " + projectName + "\n\n";
    copiedText += "## Resources\n\n";
    copiedText += "#### Read or watch:\n\n";
    resources.forEach(function(obj){
      copiedText += "* [" + obj.resource + "](./" + obj.link + ")\n";
    });
    copiedText += "## Learning Objectives\n\n";
    learningObjectives.forEach(function(obj) {
      copiedText += "### " + obj.category + "\n\n";
      obj.objectives.forEach(function(objective) {
        copiedText += "* " + objective + "\n";
      });
    });
	copiedText += "## Tasks\n\n";
    copiedText += "| Task | File |\n";
    copiedText += "| ---- | ---- |\n";
    files.forEach(function(pair) {
      copiedText += "| " + pair.task + " | [" + pair.file.substring(6) + "](./"+ pair.file.substring(6) +") |\n";
    });

    saveToFile(copiedText);
  });
  }
});

function saveToFile(text) {
  var blob = new Blob([text], { type: 'text/plain' });
  var fileName = 'README.md';
  var downloadLink = document.createElement('a');
  downloadLink.href = URL.createObjectURL(blob);
  downloadLink.download = fileName;
  downloadLink.click();
}
