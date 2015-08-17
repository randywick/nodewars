# nodewars
NODEWARS is a [Codewars](https://www.codewars.com) API client written in JavaScript for Node.js.  NODEWARS aims to provide a simple and local management and archiving solution for your Codewars solutions.

## Installation
1. Clone this project into the location of your choice
2. ```chmod +x <project_dir>/nodewars```
3. ```npm install``` (no packaged node_modules here!)
4. Add the project root to your PATH environment variable if you want to be able to invoke it from anywhere.  I probably used the wrong directory detection method, however, so you may want to just run it from the project root for now.

## Configuration
The first time you run the program, you will be required to respond to a few configuration options.  You may want to have your Codewars API Access Token handy (available [here](https://www.codewars.com/users/edit), as you will be asked for it.  If you want to change any of these settings at a later time, simply run ```nodewars config```.

## Use
You can view a list of available commands at any time by running ```nodewars --help```, or simply ```nodewars``` (no arguments).

### Display a list of all saved Katas
```nodewars list``` will display a list of all katas you have saved using NODEWARS, organized by kata state.  Optionally, you may specify a state as an argument to this command to view only katas in that state.

A kata is classified by NODEWARS as belonging to exactly one of the following states:
| State       | Description                                                                                                        |
| ----------- | ------------------------------------------------------------------------------------------------------------------ |
| not saved   | Not existing in the NODEWARS instance.  Katas viewed but not saved are termed not saved                            |
| saved       | The Kata has been saved to the project directory but training has not begun.  A Kata description is not available. |
| active      | Training has begun.  Code and description are available                                                            |
| queued      | The Kata has been submitted for evaluation but has not yet been approved or rejected                               |
| final       | The Kata has been passed all tests and is a candidate for finalization                                             |
| completed   | The Kata has been finalized.                                                                                       |

### Display detailed information about a Kata
```nodewars info <slug-or-id> [--save]``` will display detailed information about a Kata, optionally creating a new project directory for the Kata.  Use the ```--save``` flag, for example, to bookmark a Kata without triggering training.
 
### Open a Kata solution in your favorite IDE
```nodewars edit <slug-or-id>``` will open the kata's project folder in your IDE for editing.  This does not trigger any training event and may be done at any time after launching an initial training.

### Train on a specific Kata
```nodewars train <slug-or-id>``` will launch a training session, creating a template file in the kata's project folder containing all descriptions and visible tests.  No more copy and paste!

### Let Codewars choose a Kata to train on
```nodewars next [strategy]``` will use the provided strategy, or ```default``` if one is not provided, to select and begin a new training session.
A list of strategy values and descriptions can be found [here](http://dev.codewars.com/#post-train-next-code-challenge), or by simply providing an invalid strategy to NODEWARS: ```nodewars next the_best_offence_is_a_good_pretence```

### Submit a Kata solution for evaluation
```nodewars submit <slug-or-id>``` will submit the Kata for evaluation.  Be mindful of the generated text marker in the Kata's code file; if this is damaged, NODEWARS is liable to become confused as to what it should submit.

### Finalize an approved Kata solution
```nodewars finalize <slug-or-id>``` will finalize an approved Kata solution.  Note that prior to finalization, all solutions must be submitted for--and receive back--a passing evaluation.

## Development and Other Things

### Commands also have keyboard shortcuts.
The first letter of each command is also accepted.

### How come this doesn't work on <insert platform>
I wrote and tested this on Mac OS X 10.10.4.  If you would like me to change something to make this work better on your system, I'm all ears.

### What is the point of this all this nonsense anyway?
I like to work on Codewars challenges in the same environments as I write anything else.  This is simply a means of replicating challenges as local projects, providing a bit easier visibility on past solutions and a tidy system of keeping track of all of those challenges I've abandoned along the way.

### Why do you have like nineteen ways of doing the same thing?
I wrote this in one day, having not slept well the night before.  I probably committed all sorts of atrocities in the writing of this code.

### This is garbage.  A twelve-year-old could have written it.
That's a bit direct, but point well taken.  Please submit any issues through this page, or feel free to fork the project and make it amazing.

## License
The MIT License (MIT)

Copyright (c) 2015 Randy Wick

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

