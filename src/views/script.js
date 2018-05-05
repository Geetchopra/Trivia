
/* opens and closes top responsive nav bar in small devices */
function changeNavBar() {
  let doc = document.getElementById('top_nav');
  if (doc.className === 'topnav') {
    doc.className += ' responsive';
  } else {
    doc.className = 'topnav';
  }
}


/*
* gets and sorts categories from the restful api for id="trivia_cat"
* this function runs automatically
*/
$(() => {
  $.ajax({
    type:'GET',
    url: 'https://opentdb.com/api_category.php',
    success:(data) => {
      $("#trivia_cat").append($('<option>', {
        value: '',
        text: '-- Select --'
      }));
      let sorted = data.trivia_categories.sort((a, b) => {
        if (a.name > b.name) {
          return 1;
        }
        if (a.name < b.name) {
          return -1;
        }
        return 0;
      });
      $.each(sorted, (i, item) => {
        $("#trivia_cat").append($('<option>', {
          value: item.id,
          text: item.name
        }));
      });
    },
    error: (XMLHttpRequest, textStatus, errorThrown) => {
      document.getElementById('trivia_cat').innerHTML = '<option value="">SERVER ERROR: ' +
      'Try again later.</option>';
      alert('The server is unable to process your request. Please try again later.');
    },
    complete: () => {
        if ($('#trivia_cat').attr('value') != "") {
            $('#trivia_cat').val($('#trivia_cat').attr('value'));
          }
    }

  });
});

$(document).ready(() => {
    url = document.URL.split("/")
  if (url[url.length - 1] == "newgame" && document.getElementById('trivia_questions').childNodes.length > 1) {
    // console.log(document.getElementById("trivia_questions").childNodes.length)
    document.getElementById('trivia_questions').style.display = 'block';
    document.getElementById('new_game').style.display = 'none';
    initImages(document.getElementsByClassName('single_question').length);
    questions_list = document.getElementsByClassName('single_question');
    //console.log(correct);
  }
});

$(document).ready(() => {
    $('#trivia_manage_type').on('change', () => {
        if( $('#trivia_manage_type').val() === "boolean"){
            $("#boolean_answers").show();
            $("#multiple_answers").hide();
            $("#question_input1").removeAttr('required');
            $("#question_input2").removeAttr('required');
            $("#question_input3").removeAttr('required');
            $("#question_input4").removeAttr('required');
            $("#boolean_answer1").attr('required', '');
            $("#boolean_answer2").attr('required', '');
            $('#question_input1').val('');
            $('#question_input2').val('');
            $('#question_input3').val('');
            $('#question_input4').val('');
        } else{
            $("#boolean_answers").hide();
            $("#multiple_answers").show();
            $("#question_input1").attr('required', '');
            $("#question_input2").attr('required', '');
            $("#question_input3").attr('required', '');
            $("#question_input4").attr('required', '');
            $("#boolean_answer1").removeAttr('required', '');
            $("#boolean_answer2").removeAttr('required', '');
            $('#boolean_answer1').val('');
            $('#boolean_answer2').val('');
        }
    });
});


$(document).ready(() => {
    if ($('#diff_level').attr('value') != "") {
        $('#diff_level').val($('#diff_level').attr('value'));
    }
    if ($('#trivia_manage_type').attr('value') != "") {
        $('#trivia_manage_type').val($('#trivia_manage_type').attr('value'));
    }

    if ($('#trivia_manage_type').attr('value') == 'boolean') {
        $('#boolean_answer1').val($('#boolean_answer1').attr('value'));
        $('#boolean_answer2').val($('#boolean_answer2').attr('value'));
        $('#question_input1').val('');
        $('#question_input2').val('');
        $('#question_input3').val('');
        $('#question_input4').val('');
        $("#question_input1").removeAttr('required');
        $("#question_input2").removeAttr('required');
        $("#question_input3").removeAttr('required');
        $("#question_input4").removeAttr('required');
        $("#boolean_answer1").attr('required', '');
        $("#boolean_answer2").attr('required', '');
    } else if ($('#trivia_manage_type').val() == 'multiple') {
        $('#boolean_answer1').val('');
        $('#boolean_answer2').val('');
        $('#question_input1').val($('#question_input1').attr('value'));
        $('#question_input2').val($('#question_input2').attr('value'));
        $('#question_input3').val($('#question_input3').attr('value'));
        $('#question_input4').val($('#question_input4').attr('value'));
        $("#question_input1").attr('required', '');
        $("#question_input2").attr('required', '');
        $("#question_input3").attr('required', '');
        $("#question_input4").attr('required', '');
        $("#boolean_answer1").removeAttr('required', '');
        $("#boolean_answer2").removeAttr('required', '');
    }
}); 

// /*
//  * gets user input fields and sets api url_path accordingly
//  * only if all input fields have values and runs requestQuestions()
//  */
//  function getUserInput() {
//     let url_path = "https://opentdb.com/api.php?"
//     let num_questions = document.getElementById("num_questions").value;
//     url_path += "amount=" + num_questions;
//     let e2 = document.getElementById("trivia_cat");
//     let category_num = e2.options[e2.selectedIndex].value;
//     url_path += "&category=" + category_num;
//     let e3 = document.getElementById("diff_level");
//     let diff_level = e3.options[e3.selectedIndex].value;
//     url_path += "&difficulty=" + diff_level;
//     let e4 = document.getElementById("trivia_type");
//     let trivia_type = e4.options[e4.selectedIndex].value;
//     url_path += "&type=" + trivia_type;
//     if (num_questions > 0 && category_num > 0 && diff_level != "" && trivia_type != "") {
//         requestQuestions(url_path, num_questions);
//     }
// }

// /* requests questions from api and creates <div>'s based on the results recieved */
// let correct = [];
// function requestQuestions(url_path, num_questions) {
//     alert("We are preparing the Trivia Quiz. This may take a few seconds. Please wait.");
//     correct = [];
//     document.getElementById("trivia_questions").innerHTML = "";
//     $.ajax({
//         type: "GET",
//         url: url_path,
//         success: function(data) {
//             if (data.response_code === 1) {
//                 alert("There are No Questions with these combinations." +
//                     "\nPlease try a different combination of:" +
//                     "\n\n\tNumber of Questions, Category, Difficualy, Type");
//             } else {
//                 initImages(num_questions);
//                 document.getElementById("trivia_questions").style.display = "block";
//                 document.getElementById("new_game").style.display = "none";
//                 let q_id = 0;
//                 let num_q = 0;
//                 $.each(data.results, function(i, item) {
//                     num_q++;
//                     correct.push(item.correct_answer);
//                     let choices = item.incorrect_answers;
//                     choices.push(item.correct_answer);
//                     choices.sort();
//                     let mult_choices = "";
//                     for (let j = 0; j < choices.length; j++) {
//                       q_id++;
//                       let clicked_id = "'opt_" + q_id + "'";
//                       mult_choices +=
//                       '<input id="opt_' +
//                       q_id +
//                       '" type="radio" name="mult_opt" class="radio_opt" value="' +
//                       choices[j] +
//                       '"><label for="opt_' +
//                       q_id +
//                       '" class="radio_label" '+ 'onclick="questionAnswered(' + clicked_id + ')"' +'><div class="opt_text">' +
//                       choices[j] +
//                       "</div></label>";
//                   }
//                   $("#trivia_questions").append(
//                       '<div class="single_question"><h4 class="q_name" style="margin-bottom: 10px;">Question' +
//                       num_q +
//                       '</h4><h3 class="q_text" style="margin-bottom: 10px;">'+
//                       item.question +
//                       '</h3><form onsubmit="return false">' +
//                       mult_choices +
//                       '<input type="radio" name="mult_opt" class="radio_opt" value=" " checked>' +
//                       '</div>'
//                       );
//               });
//                 $("#trivia_questions").append(
//                     '<div id="check_marks">' + imagesArray.join(' ') + '</div>'
//                     );
//                 questions_list = document.getElementsByClassName("single_question");
//             }
//         },
//         error: function(XMLHttpRequest, textStatus, errorThrown) {
//             alert("The server is unable to process your request. Please try again later.");
//         }
//     });
// }


/* create checkmark images for the questions */
let imagesArray = [];
function initImages(num_questions) {
  img = '<img id="q_img{}" class="q_image" src="images/yellow_circle_star.png" onclick="goToQuestion({})" height="60" width="60" alt="Unseen Question{}">'
  for (i = 0; i < num_questions; i++) {
    imagesArray.push(img.replace(/{}/g, i + 1))
  }
  imagesArray[0] = imagesArray[0].replace(/yellow_circle_star/g, "green_circle")
  $("#trivia_questions").append(
    '<div id="check_marks">' + imagesArray.join(' ') + '</div>'
  );
}


/* move to a different question, update the new question check mark as seen */
let questions_list = [];
let select_q_num = 0;
function goToQuestion(q_num) {
  questions_list[select_q_num].style.display = "none";
  select_q_num = q_num - 1;
  img = document.getElementById("q_img" + (select_q_num + 1));
  src = img.src.split("/");
  if (src[src.length - 1] == "yellow_circle_star.png") {
    img.src = "images/green_circle.png";
  }
  questions_list[select_q_num].style.display = "block";
}


/* check if all questions have been answered */
function showScore() {
  imgs = document.getElementsByClassName("q_image");
  for (i = 0; i < imgs.length; i++) {
    src = imgs[i].src.split("/");
    if (src[src.length - 1] != "green_circle_check.png") {
      return false;
    }
  }
  return true;
}


/* update check mark to answered, if all questions answered show result */
function questionAnswered(clicked_id) {
  if (showScore()) {
    document.getElementById(clicked_id).checked = true;
    document.getElementById("check_marks").remove();
    imagesArray = [];
    questions_list[select_q_num].style.display = "none";
    select_q_num = 0;
    questions_list[select_q_num].style.display = "block";
    questions_list = [];
    document.getElementById("trivia_questions").style.display = "none";
    document.getElementById("score_result").style.display = "block";

    // calculates score based on correct answers after the last question is answered
    let form = document.getElementById("trivia_questions");
    let inputs = form.getElementsByTagName("input");
    let values = [];
    for (let i = 0; i < inputs.length; i++) {
      if (inputs[i].type === "radio" && inputs[i].checked) {
        values.push(inputs[i].value);
      }
    }
    let num_correct = 0;
    for (let i = 0; i < correct.length; i++) {
      if (correct[i] === values[i]) {
        num_correct++;
      }
    }
    let redirNewgame = "location.href='newgame'";
    let redirHome = "location.href='/'";
    let result = '<h2>Your Score: ' +
    num_correct +
    ' / ' +
    correct.length +
    '</h2>';
    result += '<button onclick="' + redirNewgame + '" style="margin-top:20px;' +
    'background-color:transparent; border: solid 3px white;">Play Another Game</button>';
    result += '<button onclick="' + redirHome + '" style="margin-top:20px;' +
    'background-color:transparent;border: solid 3px white;">Cancel</button>';
    document.getElementById("score_result").innerHTML = result;

    if (num_correct > 0) {
        $.ajax({
            type:'POST',
            url: '/updateScore',
            data: {num_correct: num_correct},
            success:(data) => {
                console.log(data);
            },
            error: (XMLHttpRequest, textStatus, errorThrown) => {
            console.log(textStatus);
            }
        
        });
    }

  } else {
    img = document.getElementById("q_img" + (select_q_num + 1));
    src = img.src.split("/");
    if (src[src.length - 1] == "green_circle.png") {
      img.src = "images/green_circle_check.png";
    }
    if (showScore()) {
      questionAnswered(clicked_id);
    }
  }
}
