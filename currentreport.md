# Blockchain-Based Electronic Voting System: A Feasibility Study

**Student Names:** Mohammed Omer, Prathmesh Mehrotra
**Student IDs:** 2022A7PS0155U, 2022A7PS0230U
**Abstract**
Conventional electronic voting systems encounter substantial obstacles, including security
weaknesses, insufficient transparency, susceptibility to manipulation, and challenges in
preserving voter privacy while guaranteeing vote integrity. This research examines the viability
of deploying a blockchain-based electronic voting system to tackle these significant challenges.
The proposed solution uses blockchain's built-in features of being unchangeable, decentralised,
and open to create a secure, verifiable, and tamper-proof voting system. This study assesses the
viability of blockchain technology for electoral processes through an extensive feasibility
analysis encompassing technical, operational, economic, and legal dimensions. The results show
that blockchain can greatly improve security and transparency, but problems with scalability,
voter anonymity, the digital divide, and following the rules must be dealt with carefully. This
study offers suggestions for putting blockchain-based voting systems into place and points out
areas that need more research and development.
**Keywords**
Blockchain, Electronic Voting, Smart Contracts, Decentralization, Cryptographic Security,
Digital Democracy

**1. Introduction
1.1 Background of the Problem**
Electoral systems are the basis of democratic government, but they still have problems in the
digital age. Old-fashioned paper-based voting systems take a lot of time and resources, and
people can make mistakes or change the results. Electronic voting systems have been put in place
in some places to make the electoral process more modern, but they have run into a lot of
problems, such as security breaches, a lack of public trust, centralised control vulnerabilities, and
trouble providing transparent verification mechanisms while keeping voter anonymity. In recent
years, there have been a lot of arguments about the integrity of elections, from claims of vote
tampering to worries about foreign interference and system hacking. These problems have made
people less sure about the results of elections and shown how important it is to have voting
systems that are safe, open, and able to be checked.


**1.2 Significance and Impact**
The integrity of voting systems has a direct effect on the legitimacy of democracy and the
participation of citizens. A strong electronic voting system could get more people to vote by
making it easier and more convenient to do so, lowering the costs of elections, speeding up the
counting of votes, reducing human errors, and making the process of running elections more
open. For countries with a lot of people or people who live far apart, a good digital voting system
could make it much easier for people to vote and make the process less complicated.
**1.3 Motivation for Using Blockchain**
Blockchain technology has some unique features that make it a good fit for secure voting
systems. Its decentralised structure gets rid of single points of failure. The immutable ledger
makes sure that votes can't be changed or deleted once they've been cast. Cryptographic
mechanisms provide strong security guarantees. Transparency lets people see the audit process
without giving up privacy. Smart contracts can automate the processes of counting and validating
votes. These qualities make blockchain a good choice for solving the main problems that
modern voting systems face.
**1.4 Research Objectives**
This study seeks to assess the feasibility of a blockchain-based electronic voting system through
the analysis of technical specifications and architectural considerations, evaluation of operational
viability and stakeholder adoption challenges, examination of economic ramifications and
cost-benefit analysis, investigation of legal and regulatory compliance requirements,
identification of potential limitations and mitigation strategies, and provision of
recommendations for practical implementation. This thorough study aims to find out if
blockchain technology can help solve the problems that modern voting systems face.

**2. Literature Review
2.1 Existing Voting Solutions**
Current voting systems can be categorized into paper-based systems, which remain the most
widely used method globally but suffer from high costs, slow counting, and vulnerability to
physical tampering; Direct Recording Electronic (DRE) systems, which use electronic interfaces
but have faced criticism due to lack of paper trails and potential for software manipulation;
optical scan systems, which combine paper ballots with electronic counting but still require
centralized tabulation; and internet-based voting systems, which have been piloted in several
countries but face significant security concerns and digital divide issues.
**2.2 Blockchain Interventions in Voting**


Several research initiatives and pilot projects have explored blockchain for voting applications.
Studies have proposed various architectures including permissioned blockchains for controlled
access, public blockchains for maximum transparency, hybrid models combining on-chain and
off-chain components, and layer-2 solutions for scalability. Notable implementations include
Estonia's consideration of blockchain for their existing e-voting infrastructure, pilot projects in
US municipalities for local elections, academic prototypes demonstrating proof-of-concept
systems, and corporate implementations for shareholder voting. Research has demonstrated that
blockchain can provide cryptographic proof of vote integrity, enable end-to-end verifiability,
reduce dependency on trusted third parties, and create permanent audit trails.
**2.3 Identified Gaps and Limitations**
Despite promising research, significant gaps remain in the literature and practical
implementations. Most studies focus on technical architecture without adequately addressing
user experience and accessibility, particularly for non-technical voters. The tension between
transparency and voter anonymity remains incompletely resolved in many proposals. Scalability
challenges for national-level elections with millions of voters require further investigation. Legal
and regulatory frameworks for blockchain-based voting are largely undeveloped. The risk of
coercion and vote-selling in remote voting scenarios needs more attention. Additionally, there is
insufficient research on disaster recovery and contingency planning for blockchain voting
systems. These gaps highlight the need for comprehensive feasibility studies that consider not
only technical aspects but also operational, economic, and legal dimensions.

**3. Problem Statement
3.1 Precise Definition**
Current electronic voting systems face a fundamental trilemma: achieving security, transparency,
and privacy simultaneously. Existing solutions typically compromise on one or more of these
requirements. Centralized systems create single points of failure and require voters to trust
election authorities completely. Security vulnerabilities can lead to vote manipulation, while lack
of transparency prevents voters from verifying that their votes were counted correctly.
Additionally, high costs, logistical complexities, and accessibility barriers limit democratic
participation. The problem addressed in this study is how to design and implement an electronic
voting system that provides cryptographic security guarantees, enables transparent verification
without compromising voter privacy, eliminates central points of failure through
decentralization, maintains an immutable record of all votes cast, ensures accessibility for all
eligible voters regardless of technical expertise, and operates within acceptable cost and
performance parameters.


**3.2 Stakeholders Involved**
A blockchain-based voting system affects a lot of different groups of people. Voters need a safe,
easy-to-use system that keeps their information private and lets them check their votes. Election
officials need tools to run elections, keep an eye on the integrity of the system, and make sure the
results can be checked. Candidates for office and political parties need to be sure that the votes
are counted fairly and accurately. The infrastructure must be built and maintained by technology
providers and developers. Government agencies and regulatory bodies need to make sure that
people follow the rules and laws about elections. Civil society groups and election observers
need ways to check and verify things on their own. Cybersecurity professionals must verify
system security and detect vulnerabilities. Lastly, the general public needs to be sure that the
election process is fair and honest.
**3.3 Challenges in Current Solutions**
Existing voting systems face numerous critical challenges. Security vulnerabilities include
susceptibility to hacking, malware infections, insider threats from privileged users, and
distributed denial-of-service attacks that can disrupt voting. Lack of transparency makes it
impossible for individual voters to verify their votes were counted correctly or that vote totals are
accurate. Centralization creates single points of failure and requires complete trust in authorities.
Privacy concerns arise from the potential for vote tracking and coercion. Operational challenges
include high costs of equipment and personnel, logistical complexity of managing polling
stations, slow vote counting processes, and limited accessibility for remote or disabled voters.
Finally, trust deficits resulting from past controversies and allegations have eroded public
confidence in electoral outcomes..

**4. Proposed Blockchain-Based Solution
4.1 Conceptual Framework**
The proposed electronic voting system based on blockchain uses distributed ledger technology to
make a voting system that is safe, open, and easy to check. There are a few important parts that
make up the system architecture. Using cryptographic key pairs, a voter registration module
checks identities and issues credentials. A system for making and sending out ballots lets
election officials set up elections and choose candidates. A secure voting interface lets voters cast
encrypted ballots from devices that have been approved. A blockchain network keeps votes safe
by storing them in an unchangeable, shared ledger. Smart contracts take care of checking votes,
counting them, and putting the results together. Voters can confirm that their votes were counted
without revealing their choices thanks to a verification mechanism. Lastly, an audit and
monitoring system lets authorised observers keep an eye on things without letting anyone else
see who voted.


**4.2 Blockchain Features Utilized**
The solution uses important features of blockchain to meet the needs of the voting system.
Immutability makes sure that once a vote is added to the blockchain, it can't be changed or
deleted. This makes for a permanent and secure record. Decentralisation spreads the voting
ledger across many nodes, which removes single points of failure and lowers the risk of
centralised manipulation. Transparency lets anyone check that the voting process and results are
fair, while cryptographic methods keep voters' names secret. Cryptographic security keeps
voters' identities and votes safe by using advanced encryption, digital signatures, and
zero-knowledge proofs. Smart contracts make it easier to count and check votes, which cuts
down on mistakes made by people and lets results come in right away. Consensus mechanisms
make sure that all nodes agree on the state of the voting ledger, which stops records that are
wrong or fake. Finally, auditability gives a complete record of all transactions that can be used to
check the results of the election and settle disputes.
**4.3 High-Level Architecture
Figure 1: Blockchain-Based Voting System Architecture**


**4.4 Workflow Process**
The voting process uses a secure, multi-step workflow. When they register, eligible voters do so
through a verified identity management system and get cryptographic credentials in the form of
public-private key pairs. During the authentication phase, voters log in using more than one
method, such as credentials, biometrics, or hardware tokens. Authenticated voters get the ballot
for their area, which is made on the fly by smart contracts. Voters choose their candidates
through an easy-to-use interface. Their votes are encrypted with their private key and
homomorphic encryption, and the encrypted vote is then digitally signed and sent to the
blockchain network. Smart contracts check to make sure that the voter is eligible, that there is no
double voting, and that the cryptographic signatures are correct during validation. During the
recording phase, the validated vote is added to the blockchain, copied to all of the distributed
nodes, and a receipt token is sent to the voter.
Voters can use their receipt token to make sure their vote was counted without giving away what
it was by using zero-knowledge proofs. Finally, when voting ends and the counting and results
phase begins, smart contracts automatically decrypt and count votes using threshold
cryptography, publish the results to the blockchain, and create full audit trails.
**4.5 Justification for Blockchain**
Blockchain technology is great for electronic voting because it has a number of important
benefits. The immutable ledger stops people from changing votes after they have been cast
because any attempt to do so would be immediately obvious through hash verification.
Decentralised architecture does away with central authorities as single points of failure and
spreads trust among all the people on the network.
Cryptographic security uses advanced encryption schemes to give strong mathematical proof
that votes are safe and private. Transparent verification lets anyone check the voting process and
confirm the results while keeping each voter's identity secret. Smart contracts that automatically
carry out tasks cut down on the need for human involvement, cut down on mistakes, and speed
up the process of counting results. Because the system is so strong, it can handle distributed
denial-of-service attacks and infrastructure failures. These features directly address the main
problems that traditional electronic voting systems have and explain why blockchain should be
used as the underlying technology.

**5. Feasibility Study
5.1 Technical Feasibility**
When building a blockchain-based voting system, you need to think carefully about all the parts
and problems that come with it. When choosing a platform, you need to think about whether to


use public blockchains like Ethereum for maximum transparency, permissioned blockchains like
Hyperledger Fabric for controlled access, or a mix of the two. For national elections,
permissioned blockchains may be better for keeping track of node participation and following
the rules. Scalability is a major technical problem. A national election could mean counting
millions of votes in a short amount of time. Some possible solutions are using layer-2 scaling
solutions like state channels or sidechains, sharding to split up the blockchain, making consensus
mechanisms work better to get more transactions through, and off-chain vote collection with
regular batch commitments to the main chain.
Performance testing shows that modern blockchain platforms can handle thousands of
transactions per second. This could be enough for most elections if the architecture is set up
correctly. Cryptographic requirements include homomorphic encryption to allow vote counting
without decrypting the votes, zero-knowledge proofs to verify votes without revealing their
contents, threshold cryptography to allow multiple people to use the same decryption keys,
digital signatures to prove identity, and secure multi-party computation to keep the tally private.
To work with other systems, voter registration databases need APIs, interfaces with national
identity systems, compatibility with electoral management software, and secure connections to
systems that publish results.
The development stack could include Solidity or Chaincode for smart contracts, React or Vue for
web interfaces, mobile apps for iOS and Android, cloud infrastructure for hosting nodes, and
security tools for testing and monitoring.
**5.2 Operational Feasibility**
To be successful, the implementation must start with pilot programs in small jurisdictions,
gradually grow to larger populations, run alongside traditional systems during the transition, and
include thorough training programs for everyone involved. User experience design must
prioritise simplicity and accessibility, providing intuitive interfaces for non-technical users,
multi-language support, accessibility features for users with disabilities, comprehensive help
documentation and support channels, and fallback mechanisms for technical difficulties. Some of
the problems with adoption are getting voters to believe in the system, teaching people how to
use it and how to keep it safe, training election officials and poll workers, dealing with resistance
from traditional election stakeholders, and managing the digital divide that affects people who
aren't very good with technology.
Operational procedures must include how to register voters and give out credentials, how to set
up the election and configure the ballots, how to monitor the system during voting, how to
respond to incidents, how to check and publish the results, and how to do audits and analysis
after the election. Some of the things that need to be done for maintenance are keeping an eye on
security and making sure it stays up to date, optimising system performance on a regular basis,
fixing bugs and updating software, making backups and recovering from disasters, and training


and supporting stakeholders on an ongoing basis. Change management, getting stakeholders
involved, and making sure there is enough training and support infrastructure are all very
important for operational implementation to work.
**5.3 Economic Feasibility**
Economic viability requires careful analysis of costs and benefits. Initial development costs
include blockchain platform setup and configuration, smart contract development and testing,
user interface and application development, security audits and penetration testing, integration
with existing systems, and pilot program implementation. Infrastructure investments cover
blockchain node hardware and hosting, network infrastructure and bandwidth, data centers and
backup facilities, security systems and monitoring tools, and voter authentication devices.
Ongoing operational costs encompass system maintenance and updates, node operation and
hosting fees, technical support and helpdesk operations, security monitoring and incident
response, voter education and training programs, and regular audits and compliance checks. For
a national implementation, initial costs might range from ten to fifty million dollars, with annual
operational costs of several million dollars depending on scale and requirements.
Potential cost savings include reduced need for physical polling infrastructure, fewer poll
workers and administrative staff, faster vote counting and result tabulation, reduced printing and
logistics costs, and decreased potential for costly recounts and disputes. Additional benefits
include increased voter turnout leading to more representative elections, improved election
integrity reducing fraud costs, enhanced public trust in democratic processes, and potential for
cost-sharing with other jurisdictions using similar systems. Long-term return on investment
depends on election frequency, population size, and the value placed on improved security and
transparency. For countries with frequent elections or large populations, the system could
achieve cost parity with traditional methods within five to ten years while providing superior
security and transparency.
**5.4 Legal and Regulatory Feasibility**
Most places still don't have clear laws about blockchain voting, which makes it very hard to
make it work. Compliance requirements include laws about keeping votes secret and designing
ballots, data protection laws like GDPR or similar frameworks, cybersecurity standards and
certification requirements, accessibility laws that make sure everyone has equal access, and rules
for audits and record-keeping.
Many current election laws were written with paper or regular electronic systems in mind, so
they may need to be changed to work with blockchain technology. Data privacy rules need to


balance the need for transparency with the need for voter anonymity, set rules for where and how
data can be stored and processed, set rules for how long data can be kept and when it can be
deleted, set up ways for law enforcement to access data in cases of investigation, and protect
against mass surveillance and data mining. International issues include making sure that voting
results from blockchain are accepted in all jurisdictions, setting standards for citizens voting
from abroad, making sure that technical and legal standards are the same in all countries, and
providing legal help to each other in case of disputes or fraud claims. Governance frameworks
need to set up clear lines of authority and responsibility, figure out how to resolve disputes, make
certification processes for system components, set up bodies to oversee and monitor the system,
and make rules for system updates and changes.
To create the right regulatory frameworks for a legally sound blockchain voting system, election
officials, legal experts, technologists, and policymakers need to work closely together. Pioneer
jurisdictions may need to pass new laws that specifically deal with blockchain voting while
making sure they are still in line with constitutional requirements for free and fair elections.

**6. Potential Challenges and Limitations
6.1 Technical Challenges**
There are a number of technical problems that need to be solved in order for the implementation
to work. Blockchain throughput limits for high-volume elections, network congestion during
busy voting times, storage needs for permanent vote records, and the computational needs of
cryptographic operations all make it hard to scale. Performance problems include possible delays
in confirming votes, the need for resources to run nodes, the energy used by consensus
mechanisms, and the bandwidth needed for distributed systems. Interoperability problems
include making different systems work together, making sure that different jurisdictions use the
same standards, making sure that different voter authentication methods work together, and
making sure that different stakeholders and platforms work together. Technical complexity
makes it hard to explain the system to people who aren't tech-savvy, makes troubleshooting and
support harder, requires specialised technical knowledge, and makes security auditing and
verification harder. These problems mean that system design needs to be careful, testing needs to
be thorough, and initial deployments may need to be limited to manageable scales before they
can be expanded to larger ones.
**6.2 Operational Challenges**
Stakeholder adoption is met with opposition from election officials who are accustomed to
traditional systems, voter scepticism regarding new technology, political resistance from various
interest groups, apprehensions about job displacement for election workers, and the digital divide
that marginalises less technologically proficient populations. Usability issues include the
learning curve for voters and administrators, making sure that older or disabled voters can get to


the polls, dealing with technical problems during voting, helping voters who are having trouble,
and making sure that everyone has equal access, no matter how tech-savvy they are or what
device they have.
Change management needs a lot of training, public education campaigns, gradual transition
plans, managing parallel systems during rollout, addressing concerns, and building trust. The
challenges of maintenance include keeping an eye on security all the time and making updates,
responding to new vulnerabilities, adapting to new threats, keeping the system running for a long
time, and keeping election records for legal reasons. To successfully deal with these operational
problems, you need to keep investing in training, support systems, and change management
processes. You also need to set realistic deadlines for implementation that let people gradually
adopt and improve the new system.
**6.3 Security and Privacy Concerns**
Even though blockchain is secure, there are still some worries. Cryptographic weaknesses
include the possibility that quantum computing could break current encryption, problems with
smart contract code, problems with managing and storing keys, risks from hacked voter devices,
and side-channel attacks on cryptographic implementations.
Privacy risks include the conflict between being open and being anonymous, the possibility of
voter de-anonymization through traffic analysis, the possibility of coercion in uncontrolled
voting environments, and the possibility of vote buying or selling. Attack vectors encompass
distributed denial-of-service attacks during voting periods, malware aimed at voter devices,
social engineering and phishing attacks, insider threats from system administrators, and
nation-state level assaults on infrastructure.
Even though the system is decentralised, there are still trust dependencies, such as trust in
cryptographic implementations, reliance on the security of voter devices, dependence on identity
verification systems, and trust in the initial setup of the system and key generation. To deal with
these security issues, we need defense-in-depth strategies, regular security audits by outside
experts, plans for responding to incidents, systems for continuous monitoring, and open
disclosure of weaknesses and fixes. Privacy protections must be mathematically verifiable rather
than simply presumed, necessitating meticulous examination of potential de-anonymization
threats and corresponding defences.
**6.4 Limitations of Blockchain Applicability**
Blockchain isn't a one-size-fits-all solution, and it has some built-in problems that make it less
useful for voting apps. Immutability can be a problem when votes need to be changed for a good
reason or when voters should be able to change their minds before the polls close. When
transactions are irreversible, it is hard to fix wrong votes, and losing cryptographic keys means


you can never vote again. Blockchain technology is hard to understand and use for most people.
It also makes it hard to find qualified developers and auditors, makes it hard to do a full security
analysis, and can make things less clear for regular users instead of more clear. When it comes to
cost, blockchain infrastructure may be more expensive than simpler options for small elections,
and the extra technology costs may not be worth it for low-risk voting situations. Uncertainty in
the law means that many places don't have legal rules for blockchain voting, courts may not see
blockchain records as legally binding, and it may not be clear how to follow the rules for
elections that are already in place. Some consensus mechanisms use a lot of energy, which is bad
for the environment.
However, this can be fixed with efficient algorithms like proof-of-stake. These limitations
indicate that blockchain voting may be most suitable for particular contexts, including
high-stakes national elections where security necessitates complexity, jurisdictions with
established digital infrastructure, populations possessing advanced digital literacy, and scenarios
where existing systems have exhibited significant vulnerabilities. In other situations, simpler
electronic or traditional voting methods may be easier to use and less expensive.

**7. Conclusion
7.1 Summary of Findings**
This feasibility study has looked into how blockchain technology could help solve some of the
biggest problems with electronic voting systems. The study shows that blockchain is very secure,
open, and easy to audit because it is immutable, decentralised, and protected by cryptography.
The suggested architecture shows that it is technically possible to build a secure voting system
that can fix many of the problems with traditional electronic voting systems. The study also
finds, though, that there are big problems that need to be solved in order for the implementation
to work. Technical problems like scalability, performance optimisation, and cryptographic
complexity need careful engineering, which may mean that initial deployments are limited to
manageable scales.
Stakeholder adoption, user experience design, and effective change management strategies are all
very important for operational feasibility. Economic analysis indicates that although initial
expenses are considerable, potential long-term savings and enhancements in electoral integrity
may warrant the investment for extensive, high-stakes elections. In most places, legal and
regulatory frameworks are still not very good. Before they can be widely used, laws and policies
need to be made.
**7.2 Assessment of Blockchain Suitability**
Blockchain technology is a good choice for electronic voting applications, especially when high
levels of security, transparency, and auditability are needed. The technology solves some of the


biggest problems with centralised systems, such as having a single point of failure, not being
able to see what's going on, and making it hard to verify. The unchangeable audit trail and
cryptographic security give better guarantees than regular electronic systems. Still, blockchain
isn't the answer to all voting problems. The technology makes it harder to use, protect privacy,
and follow the rules.
Voters may have a hard time understanding and trusting the complicated cryptographic solutions
that are needed to balance transparency and anonymity. The technology itself doesn't do much to
close the digital divide or make things more accessible. These issues need to be addressed by
other policies and investments in infrastructure. The evaluation determines that blockchain-based
voting is optimal for high-stakes elections characterised by substantial security concerns,
jurisdictions possessing advanced digital infrastructure and elevated digital literacy, contexts
where transparency and auditability are critical, and circumstances where the complexity and
expense are warranted by the advantages. For elections with fewer candidates or lower stakes,
simpler options might be better.
**7.3 Recommendations for Future Work**
Based on this feasibility analysis, several recommendations emerge for advancing
blockchain-based voting systems. First, pilot implementations should be conducted in controlled
environments such as small municipal elections, organizational voting within universities or
corporations, and advisory referendums with limited legal weight. These pilots should be
rigorously evaluated for security, usability, and operational effectiveness before scaling to
higher-stakes elections.
Second, research and development should focus on scalability solutions for national-level
elections, improved cryptographic protocols balancing transparency and privacy, user interface
design for non-technical users, formal security verification methods, and quantum-resistant
cryptographic algorithms. Third, policy development is essential, including drafting of legal
frameworks specifically addressing blockchain voting, development of technical standards and
certification processes, creation of governance structures and oversight mechanisms, and
establishment of international cooperation and standards harmonization.
Finally, parallel research should explore hybrid models combining blockchain with traditional
voting methods, alternative technologies that may address similar challenges, social and
psychological factors affecting adoption and trust, and long-term sustainability and governance
models. The path to blockchain-based voting systems requires careful, incremental progress with
continuous evaluation and refinement. Success depends not only on technical excellence but also
on building public trust, developing appropriate legal frameworks, and ensuring accessibility for
all citizens. With proper planning, investment, and stakeholder engagement, blockchain


technology has the potential to significantly enhance the security, transparency, and integrity of
democratic electoral processes.
**References**
[1] S. Nakamoto, "Bitcoin: A Peer-to-Peer Electronic Cash System," 2008. [Online]. Available:
https://bitcoin.org/bitcoin.pdf
[2] K. Hjálmarsson, G. Hreiðarsson, M. Hamdaqa, and G. Hjálmtýsson, "Blockchain-Based
E-Voting System," in 2018 IEEE 11th International Conference on Cloud Computing (CLOUD),
2018, pp. 983-986.
[3] F. Shahzad and L. Crowcroft, "Trustworthy Electronic Voting Using Adjusted Blockchain
Technology," IEEE Access, vol. 7, pp. 24477-24488, 2019.
[4] B. Shahzad and J. Crowcroft, "Trustworthy Electronic Voting Using Blockchain Technology,"
Digital Threats: Research and Practice, vol. 1, no. 1, pp. 1-25, 2020.
[5] K. Curran, "E-Voting on the Blockchain," Journal of British Blockchain Association, vol. 1,
no. 2, pp. 1-6, 2018.
[6] P. Tarasov and H. Tewari, "The Future of E-Voting," IADIS International Journal on
Computer Science and Information Systems, vol. 12, no. 2, pp. 148-165, 2017.
[7] N. Kshetri and J. Voas, "Blockchain-Enabled E-Voting," IEEE Software, vol. 35, no. 4, pp.
95-99, 2018.
[8] A. Abuidris, R. Kumar, and W. Wang, "A Survey of Blockchain Based on E-Voting
Systems," in Proceedings of the 2019 2nd International Conference on Blockchain Technology
and Applications, 2019, pp. 99-104.
[9] M. Pawlak, J. Guziur, and A. Poniszewska-Marańda, "Towards the Intelligent Agents for
Blockchain E-Voting System," Procedia Computer Science, vol. 141, pp. 239-246, 2018.
[10] Y. Liu and Q. Wang, "An E-voting Protocol Based on Blockchain," IACR Cryptology ePrint
Archive, 2017.
[11] D. Khoury, E. F. Kfoury, A. Kassem, and H. Harb, "Decentralized Voting Platform Based on
Ethereum Blockchain," in 2018 IEEE International Multidisciplinary Conference on Engineering
Technology (IMCET), 2018, pp. 1-6.
[12] V. Buterin, "Ethereum White Paper: A Next Generation Smart Contract & Decentralized
Application Platform," 2014.


[13] B. Hardwick, A. Akram, K. Markantonakis, R. Sauveron, and A. Zacharopoulos, "E-Voting
with Blockchain: An E-Voting Protocol with Decentralisation and Voter Privacy," in 2018 IEEE
International Conference on Internet of Things and IEEE Green Computing and
Communications, 2018.
[14] J. McCorry, S. F. Shahandashti, and F. Hao, "A Smart Contract for Boardroom Voting with
Maximum Voter Privacy," in International Conference on Financial Cryptography and Data
Security, 2017, pp. 357-375.
[15] A. Barnes, C. Brake, and T. Perry, "Digital Voting with the Use of Blockchain Technology,"
Plymouth University, 2016.
