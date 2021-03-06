  $(document).ready(function(){

    var $mainDiv = $('.container.main-content');

    //After button is clicked, the page clears and loads a question
    var takeQuiz = $('#takeQuiz');
    takeQuiz.click(function(event){
      clearPage();
      loadQuiz();
    });

  //Function to clear the page
  function clearPage(){
    $mainDiv.empty();
  }

  var formHTML;
  var currentUserId;
  var creatureResult;
  var mainUser;

  //Appends the result and form to the page
  function loadCreaturePage(result){

    $.ajax({
      method: "GET",
      url: '/api/creatures/',
      success: captureCreature,
      error: onError
    });

    function captureCreature(creatures){
      creatures.forEach(function(creature){
        if(creature.creatureType == result){
          creatureResult = creature;
           formHTML = `
            <form>
              <div class="row">
                <div class="col-md-offset-3 col-md-3"><label>Name</label></div><div class="col-md-3"><input type="text" name="name" id="form_name" required></div>
              </div>
              <div class="row">
                <div class="col-md-offset-3 col-md-3"><label>City</label></div><div class="col-md-3"><input type="text" name="city" id="form_city" required></div>
              </div>
              <div class="row age">
                <div class="col-md-offset-3 col-md-3"><label>Age</label></div><div class="col-md-3"><input type="text" name="age" id="form_age" required></div>
              </div>
              <div class="row">
                <div class="col-md-offset-3 col-md-3"><label>Gender</label></div><div class="col-md-3"><input type="radio" value="male" name="gender" id="form_male" required>Male <input type="radio" value="female" name="gender" id="form_female">Female</div>
              </div>
              <div class="row">
                <div class="col-md-offset-3 col-md-3"><label>Image URL</label></div><div class="col-md-3"><input type="text" name="imgUrl" id="form_imgUrl" required></div>
              </div>
              <div class="row">
                <div class="col-md-offset-3 col-md-3"><label>Favorite Color</label></div><div class="col-md-3"><input type="text" name="favoriteColor" id="form_favoriteColor" required></div>
              </div>
              <div class="row">
                <div class="col-md-offset-3 col-md-3"><label>Favorite Food</label></div><div class="col-md-3"><input type="text" name="favoriteFood" id="form_favoriteFood" required></div>
              </div>
              <div class="row weaponName">
                <div class="col-md-offset-3 col-md-3"><label>Weapon Name</label></div><div class="col-md-3"><input type="text" name="weaponName" id="form_weaponName" required></div>
              </div>
              <input type="hidden" name="creature" value="${creatureResult.creatureType}">
              <div class="row">
                <div class="col-md-offset-3 col-md-3"><input id="formSubmit" type="submit"></div>
              </div>
            </form>
            `;

          var article = (creatureResult.creatureType == "Elf" || creatureResult.creatureType == "Ent" ? "an" : "a");

          $mainDiv.append(`
            <div class="creature">
              <img class="creatureImage" src='${creatureResult.imageUrl}'>
              <h1>You are ${article} ${creatureResult.creatureType}!</h1>
              <p>${creatureResult.description}</p>
            </div>
            <div class="userData">
              ${formHTML}
            </div>
            <div class="allUsers">
            </div>
            `);

          var $form = $('form');
          $form.on('submit', function(event){
            event.preventDefault();

            //check if age is a number, and if not prompt user to enter a number
            if (isNaN(parseInt($('#form_age').val()))){

              //if there's not already an error message, add an error message
              if($('.errorMessage').length == 0){
                $('.row.age').after(function(){
                  return '<div class="row"><div class="col-md-offset-6 col-md-6 errorMessage"><p>*Please enter a number for Age</p></div></div>'
                });
              }
            }
            //if input types are good, submit form
            else {
              $.ajax({
                method: 'POST',
                url: '/api/users',
                data: $form.serialize(),
                success: loadMainProfile,
                error: onError
              });
            }
          });
        }
      });
    }
  }

  function onError(xhr, ajaxOptions, thrownError){
    console.log(xhr);
    console.log(ajaxOptions);
    console.log(thrownError);
  }



  function loadMainProfile(newUser){
    mainUser = newUser;
    if (mainUser.gender == "male"){
      mainUser.pronoun = "his"
    } else {
      mainUser.pronoun = "her"
    };
    $('.userData').empty();
  	$('.userData').append(eval('`' +creatureResult.madlib + '`'));

  	loadProfiles();
  }


  //GETS ALL User profiles and renders to page
  function loadProfiles() {
    //first clear all profiles and turn of event listeners so there won't be multiple
    $(".allUsers").empty();
    $('.allUsers').off('click', '.editBtn').off('click', '.deleteBtn');
    $('.allUsers').off('mouseover', '.userOnPage');
    $('.allUsers').off('mouseleave', '.userOnPage');
    $('#userModal').off('click', '#saveChangesBtn');

    //then get info to load all profiles fresh
	$.ajax({
      method: 'GET',
      url: '/api/users',
      success: renderMultipleUsers,
      error: onError
  	});

  	function renderMultipleUsers(users) {
  	  users.forEach(function(user) {
        renderUser(user);
      });

      //toggle visibility on hover
      $('.allUsers').on('mouseover', '.userOnPage', function(){
        $(this).children('.cornerBtn').css('visibility', 'visible')
      });
      $('.allUsers').on('mouseleave', '.userOnPage', function(){
        $(this).children('.cornerBtn').css('visibility', 'hidden')
      });

      //Deletes a user when delete button is clicked
      $(".allUsers").on('click', '.deleteBtn', function(event) {
        $.ajax({
          method: 'DELETE',
          url: '/api/users/' + $(this).parent().data("user-id"),
          success: deleteUserSuccess,
          error: deleteUserError
        });
      });

      //Opens modal when edit button is clicked
      $(".allUsers").on('click', '.editBtn', function(event) {

        currentUserId = $(this).parent().data('user-id');
        $('#userModal').modal();
        $('#userModal').data('user-id', currentUserId);
        $('#modal-form-content').html(formHTML);
        $('#formSubmit').remove();

        $.ajax({
          method:"GET",
          url: '/api/users/' +currentUserId,
          success: populateForm,
          error: onError
        });

        //Pre-populates the modal form with user's previous info
        function populateForm(user){
          $('#form_name').val(user.name);
          $('#form_city').val(user.city);
          $('#form_age').val(user.age);
          if (user.gender == "male"){
            $('#form_male').prop("checked", true);
          } else {
            $('#form_female').prop("checked", true);
          }
          $('#form_favoriteColor').val(user.favoriteColor);
          $('#form_favoriteFood').val(user.favoriteFood);
          $('#form_weaponName').val(user.weaponName);
          if (user.imgUrl != "/images/userImgCatch.gif"){
            $('#form_imgUrl').val(user.imgUrl);
          }

        }
      });

      //Updates user when save button is clicked
      $('#userModal').on('click', '#saveChangesBtn', function(event){
        event.preventDefault();
        $('.errorMessage').remove();

        var emptyFields = $('input:text').filter(function() { return this.value == ""; });

        //if we need to display either error message
         if (isNaN(parseInt($('#form_age').val())) || emptyFields.length != 0){

           //check if age is a number, and if not prompt user to enter a number
           if(isNaN(parseInt($('#form_age').val()))){
             //if there's not already an error message for NaN, add an error message
             if($('.error2').length == 0){
               $('.row.age').after(function(){
                 return '<div class="row"><div class="col-md-offset-6 col-md-6 errorMessage error2"><p>*Please enter a number for Age</p></div></div>'
               });
             }
           }

           //if there are empty fields, prompt to fill out all fields
           if (emptyFields.length != 0) {

             //if there's not already an error message for empty fields, add an error message
             if($('.error1').length == 0){
               $('.row.weaponName').after(function(){
                 return '<div class="row"><div class="col-md-offset-6 col-md-6 errorMessage error1"><p>*Please fill out all fields</p></div></div>'
               });
             }
           }
         }




        //if input types are good, submit form
        else{
          $.ajax({
            method: "PUT",
            url: '/api/users/' + currentUserId,
            data: $('form').serialize(),
            success: updateSuccess,
            error: onError
          });
        }
      });
    }
    //Small profile of users
    function renderUser(user) {

  	  $(".allUsers").append(
  	  	`<div class="userOnPage" data-user-id="${user._id}">
  	  		<div>
  	  			<img class="userImage" src="${user.imgUrl}">
  	  		</div>
  	  		<p>${user.name}</p>
  	  		<p>${user.creature.creatureType}</p>
  	  		<div class="deleteBtn cornerBtn"></div>
  	  		<div class="editBtn cornerBtn"></div>
  	  	</div>`
  	  	);
    }
    function updateSuccess(updatedUser){
      $('#userModal').modal('hide');
      $(`[data-user-id=${updatedUser._id}]`).remove();
      renderUser(updatedUser);
      loadMainProfile(updatedUser);
    }
  }

//Removes its profile from the page
function deleteUserSuccess(json) {
  var user = json;
  var userId = user._id;

  $("[data-user-id=" + userId + "]").remove();
}

function deleteUserError() {
  console.log("user deleting error!");
}


  //Appends the question and answer choices to the page
  function loadQuiz(){
    var i =0;
    var HumanPts = 0, HobbitPts = 0, ElfPts = 0, DwarfPts = 0, WizardPts = 0, EntPts =0;


    //to be assigned when question loads
    var randKeyArr;

    $.ajax({
      method: 'GET',
      url: '/api/questions',
      success: populateQuestions,
      error: onError
    });

    function populateQuestions(questionsData){
      var questions = questionsData;

      function loadQuestion(){
        var currentQ = questions[i];
        var ordKeyArr = ['A', 'B', 'C', 'D', 'E', 'F'];
        randKeyArr=_.shuffle(ordKeyArr);

        //ask question
        $mainDiv.html(`

        <h1>${questions[i].q}</h1>
        <div class="row">
          <div class="option col-md-6" data-choice="0">${currentQ[randKeyArr[0]]}</div>
          <div class="option col-md-6" data-choice="1">${currentQ[randKeyArr[1]]}</div>
          <div class="option col-md-6" data-choice="2">${currentQ[randKeyArr[2]]}</div>
          <div class="option col-md-6" data-choice="3">${currentQ[randKeyArr[3]]}</div>
          <div class="option col-md-6" data-choice="4">${currentQ[randKeyArr[4]]}</div>
          <div class="option col-md-6" data-choice="5">${currentQ[randKeyArr[5]]}</div>
        </div>

      `);
      }

      loadQuestion();
      //listen for choice
      $mainDiv.on('click', '.option', function(){

        var choice = $(this).data('choice');
        //lookup key in randomized array
        var decodedChoice = randKeyArr[choice];

        //update scores
        switch(decodedChoice){
          case "A":
            HumanPts++;
            break;
          case "B":
            HobbitPts++;
            break;
          case "C":
            ElfPts++;
            break;
          case "D":
            DwarfPts++;
            break;
          case "E":
            WizardPts++;
            break;
          case "F":
            EntPts++;
        };

        //load next question
        if(questions[i+1]){
          i++;
          loadQuestion();
        }

        //or decide creatureType and load creature page
        else{

          //decide creature result
          var score = [HumanPts,HobbitPts,ElfPts,DwarfPts,WizardPts,EntPts];
          var maxScore = Math.max(...score);
          var maxIndices = [];
          var creatureIndex;
          var creatureType;

          //find creature index
          var idx = score.indexOf(maxScore);
          while (idx != -1){
            maxIndices.push(idx);
            idx = score.indexOf(maxScore, idx+1);
          };
          if (maxIndices.length>1){
            var randomMaxIndex = Math.floor(Math.random() * maxIndices.length);
            creatureIndex = maxIndices[randomMaxIndex];
          } else {
            creatureIndex = maxIndices[0];
          }

          //translate creature index to creature type
          switch (creatureIndex){
            case 0:
              creatureType = "Human";
              break;
            case 1:
              creatureType = "Hobbit";
              break;
            case 2:
              creatureType = "Elf";
              break;
            case 3:
              creatureType = "Dwarf";
              break;
            case 4:
              creatureType = "Wizard";
              break;
            case 5:
              creatureType = "Ent";
          };

          // clear page, load result
          clearPage();
          loadCreaturePage(creatureType);
        }
      });
    }
  }
});
