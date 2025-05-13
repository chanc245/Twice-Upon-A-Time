export const stgStart_sequence = [
  {
    audio: "intro_music.mp3",
    text: `Twice Upon A Time`,
  },
];

export const stg0_sequence = [
  {
    audio: "stg0_intro_1.mp3",
    text: `Welcome to Twice Upon A Time, traveler.`,
    arduino: "allFalse",
  },
  {
    audio: "stg0_intro_2.mp3",
    text: `I will be your guide through this magical experience.`,
  },
  {
    audio: "stg0_intro_3.mp3",
    text: `In front of you, you’ll find two enchanted tools: a small keyboard and a microphone. \nThese will help you speak with the world inside the chest.`,
  },
  {
    audio: "stg0_intro_4.mp3",
    text: `This is a voice-based journey, powered by AI. Your voice will be recorded and gently woven into the story.`,
  },
  {
    audio: "stg0_intro_5.mp3",
    text: `To speak with the story, gently hold the golden keys on the small keyboard and let your voice flow clearly into the waiting microphone.`,
  },
  {
    audio: "stg0_intro_5_1.mp3",
    text: `Let’s try it now: “Do you believe every treasure chest holds something special—even if it’s invisible?"`,
  },
  {
    interaction: true,
    text: `Do you believe every treasure chest holds something special—even if it’s invisible?`,
    prompt: `Within a sentence, please encourage the user's answer.`,
  },
  {
    audio: "stg0_intro_6.mp3",
    text: `Wonderful. \nNow that you know how to interact… \nlet the tale begin.`,
  },
];

export const stg1_sequence = [
  {
    audio: "intro_music.mp3",
    text: `Once upon a thesis show time, when the weather was pleasant outside, a traveler wandered to the corner of a room.`,
  },
  {
    audio: "stg1_1.mp3",
    text: `Once upon a thesis show time, when the weather was pleasant outside, a traveler wandered to the corner of a room.`,
  },
  {
    audio: "stg1_2.mp3",
    text: `During their exploration, they discovered a curious-looking treasure chest with a golden key lying beside it.`,
  },
  {
    audio: "stg1_3.mp3",
    text: `At the front of the chest, on the right side, there was a lock hanging in place; on the left, a large keyhole almost seemed to invite them to peek inside—and the traveler couldn’t resist.`,
    arduino: "act1Switch",
  },
  {
    audio: "stg1_4.mp3",
    text: `They were immediately surprised by the wonderful things within and couldn’t wait to open it!`,
  },
  {
    audio: "stg1_5.mp3",
    text: `They picked up the key and tried it in the lock. It fit perfectly.`,
  },
  {
    audio: "stg1_6.mp3",
    text: `Then they turned it once around, and now we must wait until they have fully unlocked it and lifted the lid—only then shall we learn what wonderful things lie within that chest.`,
  },
  {
    audio: "intro_music.mp3",
    text: `Then they turned it once around, and now we must wait until they have fully unlocked it and lifted the lid—only then shall we learn what wonderful things lie within that chest.`,
  },
];

export const stgMid_sequence = [
  {
    audio: "stgMid_1.mp3",
    text: `Wonderful, traveler. I hope you enjoyed the first tale. Now, take the golden key resting before the chest and unlock its secret.`,
  },
  {
    audio: "stgMid_2.mp3",
    text: `Once the chest is open, place the display—the magical transcription device—inside, where the label awaits. When you are ready, press [The Golden Key] to continue your journey!`,
  },
];

export const stgMidDone_sequence = [
  {
    audio: "stgMid_3.mp3",
    text: `Excellent. You are now ready for the next chapter of your journey. Let the magic continue! `,
  },
];

export const stg2_sequence = [
  // {
  //   audio: "intro_music.mp3",
  //   text: `Once upon a time, a cheerful puppeteer traveled far and wide, enchanting audiences with a puppet show carried inside their chest of wonders.`,
  // },
  // {
  //   audio: "stg2_v3_1.mp3",
  //   text: `Once upon a time, a cheerful puppeteer traveled far and wide, enchanting audiences with a puppet show carried inside their chest of wonders.`,
  // },
  // {
  //   audio: "stg2_v3_2.mp3",
  //   text: `One evening, during a lively performance, they met a mysterious scholar who shared their love for theater and science.`,
  //   arduino: "act2Switch",
  // },
  // {
  //   audio: "stg2_v3_3.mp3",
  //   text: `Over drinks, the scholar asked if the puppeteer would be truly happy if the puppets became real.`,
  // },
  // {
  //   audio: "stg2_v3_4.mp3",
  //   text: `With a laugh and a clink of glasses, magic filled the air—the puppets came to life, and the puppeteer became their director.`,
  //   arduino: "allFalse",
  // },
  // {
  //   audio: "stg2_v3_5.mp3",
  //   text: `At first, the puppeteer thought they could simply sit back and watch the magic unfold.`,
  //   arduino: "act4Switch",
  // },
  // {
  //   audio: "stg2_v3_6.mp3",
  //   text: `However, it soon became clear that their puppets-turned-actors were less interested in performing and far more captivated by the wonders of the world around them.`,
  // },
  // {
  //   audio: "stg2_v3_7.mp3",
  //   text: `Determined to better understand their actors, the puppeteer decided to speak with each one individually.`,
  // },
  // {
  //   audio: "stg2_v3_8.mp3",
  //   text: `First, they found the Curious Ballerina backstage, lost in thoughtful daydreams.`,
  //   arduino: "char1Swch",
  // },
  // {
  //   audio: "stg2_v3_9.mp3",
  //   text: `As the puppeteer approached, she asked softly, “I’ve always wondered, is there more beyond the curtains—can I peek just a little?”`,
  // },
  {
    interaction: true,
    store: true,
    text: `As the puppeteer approached, she asked softly, “I’ve always wondered, is there more beyond the curtains—can I peek just a little?”`,
    prompt: `Within a sentence, please respond as a timidity ballerina to the user's response positively.`,
    voiceId: "wJqPPQ618aTW29mptyoc",
  },
  // {
  //   audio: "stg2_v3_10.mp3",
  //   text: `After speaking with the Ballerina, the puppeteer came across the Masked Acrobat, who was carefully examining their collection of masks.`,
  //   arduino: "char2Swch",
  // },
  // {
  //   audio: "stg2_v3_11.mp3",
  //   text: `The Acrobat asked with uncertainty “I’ve always chosen my masks based on what makes others happy—what if I pick a mask just because it makes me smile?”`,
  // },
  {
    interaction: true,
    store: true,
    text: `The Acrobat asked with uncertainty “I’ve always chosen my masks based on what makes others happy—what if I pick a mask just because it makes me smile?”`,
    prompt: `Within a sentence, please respond as an careful acrobat to the user's response positively.`,
    voiceId: "ZF6FPAbjXT4488VcRRnw"
  },
  // {
  //   audio: "stg2_v3_12.mp3",
  //   text: `Next, the enthusiastic Pirates approached, brimming with excitement yet also confusion.“I have so many dreams and ideas—how do I know which one to follow first?” they wondered aloud.`,
  //   arduino: "char3Swch",
  // },
  {
    interaction: true,
    store: true,
    text: `Next, the enthusiastic Pirates approached, brimming with excitement yet also confusion.“I have so many dreams and ideas—how do I know which one to follow first?” they wondered aloud.`,
    prompt: `Within a sentence, please respond as an brave pirate to the user's response positively.`,
    voiceId: "Z3R5wn05IrDiVCyEkUrK"
  },
  // {
  //   audio: "stg2_v3_13.mp3",
  //   text: `As the Pirates wandered away in contemplation, the puppeteer noticed the Traveler by the doorway, maps and backpack in hand.`,
  //   arduino: "char4Swch",
  // },
  // {
  //   audio: "stg2_v3_14.mp3",
  //   text: `With bright eyes full of curiosity, the Traveler asked, “What’s the best thing to do if the road ahead looks exciting, but I’m not sure where it leads?”`,
  // },
  {
    interaction: true,
    store: true,
    text: `With bright eyes full of curiosity, the Traveler asked, “What’s the best thing to do if the road ahead looks exciting, but I’m not sure where it leads?”`,
    prompt: `Within a sentence, please respond as an exciting traveler to the user's response positively.`,
    voiceId: "tnSpp4vdxKPjI9w0GnoV"
  },
  // {
  //   audio: "stg2_v3_15.mp3",
  //   text: `Finally, near a dressing mirror stood the Apprentice, carefully inspecting their partly finished costume.`,
  //   arduino: "char5Swch",
  // },
  // {
  //   audio: "stg2_v3_16.mp3",
  //   text: `Seeing the puppeteer approach, the Apprentice voiced their uncertainty, “If my outfit still has a few loose stitches, is it alright to step onto the stage confidently anyway?”`,
  // },
  {
    interaction: true,
    store: true,
    text: `Seeing the puppeteer approach, the Apprentice voiced their uncertainty, “If my outfit still has a few loose stitches, is it alright to step onto the stage confidently anyway?”`,
    prompt: `Within a sentence, please respond as an uncertain Apprentice to the user's response positively.`,
    voiceId: "N2yy09ofJlJaywlNAv4s"
  },
  // {
  //   audio: "stg2_v3_17.mp3",
  //   text: `Having spoken with all the actors, the puppeteer returned to the familiar chest where the puppets had rested before coming alive.`,
  //   arduino: "allFalse",
  // },
  // {
  //   audio: "stg2_v3_18.mp3",
  //   text: `Feeling both exhausted and fulfilled, they sat down beside the chest and drifted into a peaceful sleep.`,
  // },
  // {
  //   audio: "stg2_v3_19.mp3",
  //   text: `In the puppeteer’s dream, they heard their own voice gently summarizing the conversations shared with each puppet:`,
  // },
  //
];

export const stg2End_sequence = [
  // {
  //   audio: "stg2_v3_20.mp3",
  //   text: `As their voice softly faded away, each puppet smiled warmly, knowing well the wisdom that had passed between them.`,
  // },
  // {
  //   audio: "stg2_v3_21.mp3",
  //   text: `As the puppeteer awoke, warm sunlight gently touched each puppet resting within the chest—each unique, each cherished.`,
  // },
  // {
  //   audio: "stg2_v3_22.mp3",
  //   text: `With a gentle smile, the puppeteer closed the chest without locking it, quietly recognizing how each conversation had woven curiosity and courage into their life’s tapestry.`,
  // },
  {
    audio: "stg2_v3_23.mp3",
    text: `With renewed spirit, they stepped forward into the day, guided by the gentle lessons learned from their magical companions.`,
  },
  {
    audio: "intro_music.mp3",
    text: `With renewed spirit, they stepped forward into the day, guided by the gentle lessons learned from their magical companions.`,
  },
];

export const stgEnd_sequence = [
  {
    audio: "stgEnd_1.mp3",
    text: `Dear traveler, thank you for journeying through Twice Upon A Time. I hope your time here was magical.`,
  },
  {
    audio: "stgEnd_2.mp3",
    text: `Our story ends for now. If you wish, take the golden key with you as a keepsake—there is a hidden NFC chip inside!`,
  },
  {
    audio: "stgEnd_3.mp3",
    text: `May your day be filled with wonder until our paths cross again.`,
  },
];
