// Test Ink story for import testing
// Based on common Ink patterns

=== start ===
You wake up in your apartment. The sun is streaming through the window.

Today is the big day - your job interview.

VAR nervousness = 5
VAR confidence = 3
VAR has_coffee = false

* [Get ready immediately] -> get_ready
* [Make coffee first] -> make_coffee

=== make_coffee ===
You brew a strong cup of coffee.

~ has_coffee = true
~ confidence = confidence + 2
~ nervousness = nervousness - 1

Much better. Now you feel ready to face the day.

-> get_ready

=== get_ready ===
You shower and put on your best outfit.

{has_coffee:
    The coffee has helped calm your nerves.
- else:
    You wish you'd had time for coffee.
}

* [Head to the interview] -> arrive_interview

=== arrive_interview ===
You arrive at the sleek office building.

{confidence > 4:
    You feel confident and ready.
- else:
    Your hands are shaking slightly.
}

The receptionist greets you warmly.

* [Smile and introduce yourself] -> friendly_intro
* [Nod nervously] -> nervous_intro

=== friendly_intro ===
~ confidence = confidence + 1

"Welcome! Please have a seat. They'll call you shortly."

You sit down, feeling good about your friendly approach.

-> waiting_room

=== nervous_intro ===
~ nervousness = nervousness + 1

"Have a seat," she says, noticing your nervousness.

You sit down, wishing you'd been more confident.

-> waiting_room

=== waiting_room ===
You wait in the lobby, watching other candidates come and go.

{nervousness > 6:
    * [Take deep breaths to calm down] -> calm_down
}

* [Review your resume] -> review_resume
* [Check your phone] -> check_phone

=== calm_down ===
~ nervousness = nervousness - 2

You take a few deep breaths. In... out... in... out...

You feel more centered now.

-> interview

=== review_resume ===
~ confidence = confidence + 1

You review your achievements and qualifications.

You remember why you're qualified for this job.

-> interview

=== check_phone ===
~ nervousness = nervousness + 1

You scroll through social media, getting more anxious.

Bad idea. You should have prepared instead.

-> interview

=== interview ===
"Please come in," calls a voice.

You enter the interview room.

{confidence > nervousness:
    -> confident_interview
- else:
    -> nervous_interview
}

=== confident_interview ===
The interview goes well! You answer questions confidently.

Your preparation and positive attitude shine through.

"We'll be in touch," they say with a smile.

-> good_ending

=== nervous_interview ===
The interview is challenging. You stumble over some answers.

Your nervousness shows, and you can't quite find your rhythm.

"Thank you for coming in," they say politely.

-> uncertain_ending

=== good_ending ===
+ [Two weeks later...] -> got_job

=== got_job ===
The phone rings. "Congratulations! We'd like to offer you the position."

You got the job!

-> END

=== uncertain_ending ===
+ [Two weeks later...] -> no_response

=== no_response ===
You check your email for the tenth time today.

Still nothing. You start looking at other opportunities.

-> END
