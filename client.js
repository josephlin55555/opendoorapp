angular.module('angularApp', [])
  .controller('angularController', function($scope, $http, $timeout) {
    $scope.currentWordArray = [];
    $scope.finishedWordArray = [];
    $scope.timer = 60;
    $scope.points = 0;

    //timer will count down to 0
    var timeObject = function() {
      if($scope.timer > 0) {
        //At the start, initialize a random word
        if($scope.timer === 60) {
          $scope.getWord();
        }

        $timeout(function() {
          $scope.timer--;
          timeObject();
        }, 1000);
      } else {

        //gives some time for the game to end
        $timeout(function() {
         
          //can't escape modal via clicking outside or hitting escape
          $('#myModal').modal({
            backdrop: 'static',
            keyboard: false
          });

          $("#myModal").modal('show');
        }, 1000);
      }
    };
    //initializes the timer
    $timeout(timeObject, 1000);

    $scope.checkForCompletion = function() {
      if($scope.currentWordArray.length === 0) {
        $scope.getWord();
      }
    };

    $scope.keyboardPress = function(event) {
      var character = String.fromCharCode(event.charCode);
      if(character === '1') {
        $scope.getWord();
      }

      var cont = true;
      for(var i = 0; i < $scope.currentWordArray.length; i++) {

        if(character === $scope.currentWordArray[i].letter && cont === true) {          
          //in case there are two repeating letters
          cont = false;

          //points are increased
          $scope.points += 1;

          //push character to finished array
          $scope.finishedWordArray.push($scope.currentWordArray[i]);

          //delete element from current Array
          $scope.currentWordArray.splice(i, 1);
        }
      }

      //checks if entire word array has been typed
      $scope.checkForCompletion();
    };

    $scope.getWord = function() {
      $http.get('https://api.wordnik.com:80/v4/words.json/randomWord?hasDictionaryDef=true&minCorpusCount=0&maxCorpusCount=-1&minDictionaryCount=1&maxDictionaryCount=-1&minLength=5&maxLength=-1&api_key=a2a73e7b926c924fad7001ca3111acd55af2ffabf50eb4ae5').
      success(function(data, status, headers, config) {
        //reset current word
        $scope.finishedWordArray = [];
        $scope.currentWordArray = [];
        for(var i = 0; i < data.word.length; i++) {
          $scope.currentWordArray.push({letter: data.word[i], index: i});
        }
      }).
      error(function(data, status, headers, config) {
        console.log("Failed to retrieve word");
      });
    };

    $scope.restartGame = function() {
      $scope.timer = 60;
      $scope.points = 0;

      $timeout(timeObject, 1000);
      $("#myModal").modal('hide');
    };

  });