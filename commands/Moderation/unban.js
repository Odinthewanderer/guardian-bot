exports.run = (client, msg, [member, ...reason]) => {
  reason = reason.join(' ');

  client.funcs.db_getBanForAppeal(msg.guild.id, member, function (data) {
    if (!data) {
      msg.channel.send('I\'m sorry but that person doesn\'t appear in my records! Check the user ID and try again.\nIf you feel this is a mistake, you will need to contact Odin#3464 and have him take a look.');
    } else {
      const action = 'unban';
      const targetTag = data.v_member;
      const targetID = data.v_memberID;
      const author = msg.author;
      const embed = client.funcs.modlogs.createUnbanEmbed(client, author, targetTag, targetID, action, reason);
      const modLog = msg.guild.channels.find(c => c.name.toLowerCase() === client.guildConfs.get(msg.guild.id).modLog.data);
      const caseNum = data.caseNum;
      let lastMessageID = 0;
      let chkContent = '';
      let messageID = 0;

      try {
        modLog.fetchMessages({ limit: 1 })
          .then((result) => {
            const lastMessage = result.first();
            if (!lastMessage) {
              messageID = 1;
            } else {
              chkContent = (lastMessage.embeds && lastMessage.embeds.length > 0) ? lastMessage.embeds[0].title : lastMessage.content;
              lastMessageID = chkContent.match(/Case #(\d+)/i)[1];
              messageID = parseInt(lastMessageID);
              messageID += 1;
            }
            const logger = `CASE# ${messageID} :: ${targetTag} [ ${targetID} ] has been unbanned by ${msg.author.username} [ ${msg.author.id} ] in the ${msg.guild.name} for the following reason: ${reason}. -- REFERENCE [ Case #${caseNum} ]`;
            const logDir = client.guildConfs.get(msg.guild.id).logDir.data;
            client.funcs.write_log(client, logDir, msg.guild.id, logger);
            client.funcs.log(logger, 'warn');
            msg.guild.unban(member);
            msg.channel.send('Unban successful!');
            client.funcs.sqlLog(client, msg.guild.id, messageID, targetID, targetTag, msg.author.id, msg.author.tag, 'Unban', reason);
          });
      } catch (err) { client.funcs.log(err, 'error'); }
      client.funcs.modlogs.post(client, msg.guild, embed).catch(console.error);
      return 0;
    }
  });
};

exports.conf = {
  enabled: true,
  runIn: ['text'],
  aliases: [],
  permLevel: 10,
  botPerms: [],
  requiredFuncs: [],
};

exports.help = {
  name: 'unban',
  description: 'Unbans a user from the server.',
  usage: '<member:str> [reason:str]',
  usageDelim: ' ',
  extendedHelp: '',
};
