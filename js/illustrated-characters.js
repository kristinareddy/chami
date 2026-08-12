(function(global){
  const SHEETS={
    Aurora:'assets/character-bible/auro-expressions-v26.png',
    Teia:'assets/character-bible/teia-expressions-v26.png',
    Peach:'assets/character-bible/peach-expressions-v26.png'
  };

  const EXPRESSIONS={
    Aurora:[
      {label:'Joyful',message:'That joyful energy is ready for an adventure.'},
      {label:'Curious',message:'Curiosity helps your brain notice new connections.'},
      {label:'Proud',message:'You can feel proud of what you already know.'},
      {label:'Focused',message:'You look ready to concentrate on one small step.'},
      {label:'Surprised',message:'New discoveries can feel wonderfully surprising.'},
      {label:'Brave',message:'Trying before you are certain is a brave learning move.'},
      {label:'Playful',message:'A playful brain can find clever new ideas.'},
      {label:'Kind',message:'Kindness belongs in every adventure.'},
      {label:'Celebrating',message:'You did something worth celebrating!'}
    ],
    Teia:[
      {label:'Happy',message:'That happy face is ready for a little adventure.'},
      {label:'Listening',message:'Your listening ears can help you learn the sound first.'},
      {label:'Wonder',message:'Wonder is a brilliant place to begin.'},
      {label:'Focused',message:'One tap at a time is enough.'},
      {label:'Surprised',message:'You noticed something new!'},
      {label:'Tricky',message:'Tricky means Chami should give you a little more help.'},
      {label:'Silly',message:'Silly moments can make practice feel lighter.'},
      {label:'Proud',message:'You worked it out. Let yourself feel proud.'},
      {label:'Celebrating',message:'You did it! Chami and Peach are celebrating too.'}
    ],
    Peach:[
      {label:'Hello',message:'Peach is here to help.'},
      {label:'Curious',message:'Peach found something interesting.'},
      {label:'Listening',message:'Peach says: listen once more.'},
      {label:'Sorting',message:'Peach will help you take it one piece at a time.'},
      {label:'Proud',message:'Peach is proud of that careful thinking.'},
      {label:'Excited',message:'Peach found a reason to celebrate!'},
      {label:'Silly',message:'A tiny silly break can help.'},
      {label:'Calm',message:'Slow and gentle is a good way to learn.'},
      {label:'Resting',message:'Rest is part of learning too.'}
    ]
  };

  const SCENES=[
    {id:'discovery',label:'Meadow discovery',action:'Start the adventure',destination:'adventure'},
    {id:'learning',label:'Cozy learning nook',action:'Practise words',destination:'words'},
    {id:'twilight',label:'Twilight story garden',action:'Open stories',destination:'stories'},
    {id:'creation',label:'Proud creation',action:'See my growth',destination:'progress'}
  ];

  function key(character){
    if(character==='Auro') return 'Aurora';
    return SHEETS[character]?character:'Aurora';
  }

  function expression(character,index=0){
    const characterKey=key(character);
    const items=EXPRESSIONS[characterKey];
    const safeIndex=Math.max(0,Math.min(items.length-1,Number(index)||0));
    return {...items[safeIndex],index:safeIndex,character:characterKey,sheet:SHEETS[characterKey]};
  }

  function backgroundPosition(index=0){
    const safeIndex=Math.max(0,Math.min(8,Number(index)||0));
    const column=safeIndex%3;
    const row=Math.floor(safeIndex/3);
    return `${column*50}% ${row*50}%`;
  }

  function spriteStyle(character,index=0){
    const item=expression(character,index);
    return `background-image:url('${item.sheet}');background-position:${backgroundPosition(item.index)};`;
  }

  function scene(id){
    return SCENES.find(item=>item.id===id)||SCENES[0];
  }

  global.ChamiCharacters={
    sheets:SHEETS,
    familyScenes:'assets/character-bible/family-scenes-v26.png',
    expressions:EXPRESSIONS,
    scenes:SCENES,
    expression,
    backgroundPosition,
    spriteStyle,
    scene
  };
})(window);
