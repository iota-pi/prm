import {
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  AccordionActions,
  Typography,
  Divider,
} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { MuiIconType } from '../../Icons';


const useStyles = makeStyles(theme => ({
  details: {
    flexGrow: 1,
  },
  accordionRoot: {
    margin: theme.spacing(2, 0),
  },
  accordionExpanded: {
    margin: theme.spacing(2, 0),
    '&$accordionRoot:first-child': {
      marginTop: theme.spacing(2),
    },
  },
  summaryExpanded: {},
  summaryContent: {
    '&$summaryExpanded': {
      margin: theme.spacing(1.5, 0),
    },
  },
  summaryRoot: {
    '&$summaryExpanded': {
      minHeight: theme.spacing(6),
    },
  },
  detailsRoot: {
    padding: theme.spacing(2),
  },
  icon: {
    marginRight: theme.spacing(2),
  },
}));

export interface Props {
  icon?: MuiIconType,
  id: string,
  initialExpanded?: boolean,
  title: string,
  content: ReactNode,
  actions?: ReactNode,
}


function CollapsibleSection({
  icon: Icon,
  id,
  initialExpanded = false,
  title,
  content,
  actions,
}: Props) {
  const classes = useStyles();
  const [expanded, setExpanded] = useState<boolean>(false);

  const handleChange = useCallback(() => setExpanded(e => !e), []);

  useEffect(
    () => {
      if (initialExpanded) {
        setExpanded(true);
      }
    },
    [initialExpanded, id],
  );

  return (
    <Accordion
      classes={{
        root: classes.accordionRoot,
        expanded: classes.accordionExpanded,
      }}
      expanded={expanded}
      onChange={handleChange}
      square
    >
      <AccordionSummary
        aria-controls={`${id}-content`}
        classes={{
          content: classes.summaryContent,
          expanded: classes.summaryExpanded,
          root: classes.summaryRoot,
        }}
        data-cy={`section-${id}`}
        expandIcon={<ExpandMoreIcon />}
      >
        {Icon && (
          <div className={classes.icon}>
            <Icon />
          </div>
        )}

        <Typography>{title}</Typography>
      </AccordionSummary>

      <Divider />

      <AccordionDetails className={classes.detailsRoot}>
        <div className={classes.details}>
          {content}
        </div>
      </AccordionDetails>

      {actions && (
        <AccordionActions>
          {actions}
        </AccordionActions>
      )}
    </Accordion>
  );
}

export default CollapsibleSection;
