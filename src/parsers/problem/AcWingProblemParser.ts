import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class AcWingProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://www.acwing.com/problem/content/*'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('AcWing').setUrl(url);

    task.setName(elem.querySelector('.problem-content-title').textContent.trim().split('. ').pop());

    const blocks = elem.querySelectorAll('.martor-preview pre');
    for (let i = 0; i < blocks.length - 1; i += 2) {
      task.addTest(blocks[i].textContent, blocks[i + 1].textContent);
    }

    const limitsStr = elem.querySelector('.table.table-striped').textContent;
    task.setTimeLimit(parseInt(/(\d+)s/.exec(limitsStr)[1], 10) * 1000);
    task.setMemoryLimit(parseInt(/(\d+)MB/.exec(limitsStr)[1], 10));

    return task.build();
  }
}
